import { fetchClient } from './apiClient';

export const orderService = {
  checkout: (data) =>
    fetchClient('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMyOrders: (page = 1, limit = 10) =>
    fetchClient(`/orders/my-orders?page=${page}&limit=${limit}`, {
      method: 'GET',
    }),

  getOrderById: (id) =>
    fetchClient(`/orders/${id}`, {
      method: 'GET',
    }),

  cancelOrder: (id, data = {}) =>
    fetchClient(`/orders/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
