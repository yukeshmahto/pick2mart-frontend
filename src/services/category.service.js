import { fetchClient } from './apiClient';

export const categoryService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    const qs = query.toString();
    return fetchClient(`/categories${qs ? `?${qs}` : ''}`, {
      method: 'GET',
    });
  },

  getActive: () =>
    fetchClient('/categories/active', {
      method: 'GET',
    }),

  getBySlug: (slug) =>
    fetchClient(`/categories/${slug}`, {
      method: 'GET',
    }),

  create: (data) =>
    fetchClient('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    fetchClient(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    fetchClient(`/categories/${id}`, {
      method: 'DELETE',
    }),
};
