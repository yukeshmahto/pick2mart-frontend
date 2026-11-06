import { fetchClient } from './apiClient';

export const addressService = {
  getAll: () =>
    fetchClient('/users/me/addresses', {
      method: 'GET',
    }),

  getById: (id) =>
    fetchClient(`/users/me/addresses/${id}`, {
      method: 'GET',
    }),

  create: (data) =>
    fetchClient('/users/me/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    fetchClient(`/users/me/addresses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    fetchClient(`/users/me/addresses/${id}`, {
      method: 'DELETE',
    }),

  setDefault: (id) =>
    fetchClient(`/users/me/addresses/${id}/default`, {
      method: 'PATCH',
    }),
};
