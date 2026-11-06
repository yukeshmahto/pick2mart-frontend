const RAW_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const BASE_URL = RAW_URL.includes('/api/v1') ? RAW_URL.replace(/\/+$/, '') : `${RAW_URL.replace(/\/+$/, '')}/api/v1`;

export const mediaService = {
  uploadFile: async (file) => {
    if (!file) {
      throw new Error('No file provided for upload');
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const formData = new FormData();
    formData.append('file', file);

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}/media/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(data?.message || 'File upload failed');
    }

    return data;
  },
};
