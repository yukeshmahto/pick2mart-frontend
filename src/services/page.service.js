import { fetchClient } from './apiClient';

export const pageService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    const qs = query.toString();
    return fetchClient(`/pages${qs ? `?${qs}` : ''}`, {
      method: 'GET',
    });
  },

  getBySlug: (slug) =>
    fetchClient(`/pages/${slug}`, {
      method: 'GET',
    }),

  create: (data) =>
    fetchClient('/pages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    fetchClient(`/pages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    fetchClient(`/pages/${id}`, {
      method: 'DELETE',
    }),
};
