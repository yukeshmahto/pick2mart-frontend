import { fetchClient } from './apiClient';

export const bannerService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search) query.append('search', params.search);
    if (params.position) query.append('position', params.position);
    if (params.status) query.append('status', params.status);
    const qs = query.toString();
    return fetchClient(`/banners${qs ? `?${qs}` : ''}`, {
      method: 'GET',
    });
  },

  getActive: (position) =>
    fetchClient(`/banners/active${position ? `?position=${position}` : ''}`, {
      method: 'GET',
    }),

  create: (data) =>
    fetchClient('/banners', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    fetchClient(`/banners/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    fetchClient(`/banners/${id}`, {
      method: 'DELETE',
    }),
};
