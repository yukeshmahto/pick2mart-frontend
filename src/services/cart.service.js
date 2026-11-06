import { fetchClient } from './apiClient';

export const cartService = {
  getCart: () =>
    fetchClient('/cart', {
      method: 'GET',
    }),

  addItem: (variantId, quantity = 1) =>
    fetchClient('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ variantId, quantity }),
    }),

  updateQuantity: (variantId, quantity) =>
    fetchClient(`/cart/items/${variantId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }),

  removeItem: (variantId) =>
    fetchClient(`/cart/items/${variantId}`, {
      method: 'DELETE',
    }),

  clearCart: () =>
    fetchClient('/cart', {
      method: 'DELETE',
    }),
};
