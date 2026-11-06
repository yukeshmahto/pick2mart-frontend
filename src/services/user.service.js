import { fetchClient } from './apiClient';

export const userService = {
  getProfile: () =>
    fetchClient('/users/me', {
      method: 'GET',
    }),

  updateProfile: (data) =>
    fetchClient('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  changePassword: (data) =>
    fetchClient('/users/me/password', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
