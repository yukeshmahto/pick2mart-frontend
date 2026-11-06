const RAW_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const BASE_URL = RAW_URL.includes('/api/v1') ? RAW_URL.replace(/\/+$/, '') : `${RAW_URL.replace(/\/+$/, '')}/api/v1`;

let isRefreshing = false;
let refreshPromise = null;

const getTokens = () => {
  if (typeof window !== 'undefined') {
    return {
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken'),
    };
  }
  return { accessToken: null, refreshToken: null };
};

const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

const executeTokenRefresh = async () => {
  const { refreshToken } = getTokens();
  if (!refreshToken) {
    clearTokens();
    throw new Error('No refresh token available');
  }

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await res.json();
    if (!res.ok || !data?.data?.accessToken) {
      clearTokens();
      throw new Error(data?.message || 'Session expired. Please log in again.');
    }

    const newAccessToken = data.data.accessToken;
    const newRefreshToken = data.data.refreshToken || refreshToken;

    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', newAccessToken);
      if (data.data.refreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
    }

    return newAccessToken;
  } catch (err) {
    clearTokens();
    throw err;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
};

const getRefreshedToken = async () => {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshPromise = executeTokenRefresh();
  }
  return refreshPromise;
};

export const fetchClient = async (endpoint, options = {}, isRetry = false) => {
  const { accessToken } = getTokens();
  const headers = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  let data = null;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  // Handle 401 Unauthorized for eligible requests (only retry once, never retry auth login/refresh)
  const isAuthEndpoint =
    endpoint.includes('/auth/login') ||
    endpoint.includes('/auth/refresh') ||
    endpoint.includes('/auth/register');

  if (response.status === 401 && !isRetry && !isAuthEndpoint) {
    try {
      const newAccessToken = await getRefreshedToken();
      if (newAccessToken) {
        return fetchClient(
          endpoint,
          {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${newAccessToken}`,
            },
          },
          true
        );
      }
    } catch (refreshErr) {
      clearTokens();
      throw new Error('Session expired. Please log in again.');
    }
  }

  if (!response.ok) {
    const error = new Error(data?.message || 'Something went wrong');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const apiClient = {
  get: (endpoint) => fetchClient(endpoint, { method: 'GET' }),
  post: (endpoint, body) => fetchClient(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  patch: (endpoint, body) => fetchClient(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  put: (endpoint, body) => fetchClient(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint) => fetchClient(endpoint, { method: 'DELETE' }),
};
