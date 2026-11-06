import { fetchClient } from './apiClient';

export const authService = {
  login: (credentials) =>
    fetchClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData) =>
    fetchClient('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  forgotPassword: (data) =>
    fetchClient('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  verifyForgotPasswordOtp: (data) =>
    fetchClient('/auth/verify-forgot-password-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  resetPassword: (data) =>
    fetchClient('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
