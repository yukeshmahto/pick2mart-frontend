import { fetchClient } from './apiClient';

export const wishlistService = {
  getWishlist: () =>
    fetchClient('/wishlist', {
      method: 'GET',
    }),

  addToWishlist: (productId) =>
    fetchClient('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    }),

  removeFromWishlist: (productId) =>
    fetchClient(`/wishlist/${productId}`, {
      method: 'DELETE',
    }),

  clearWishlist: () =>
    fetchClient('/wishlist', {
      method: 'DELETE',
    }),
};
