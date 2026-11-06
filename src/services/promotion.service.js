import { fetchClient } from './apiClient';

export const promotionService = {
  // Public / Customer
  getActivePromotions: () =>
    fetchClient('/promotions/active', {
      method: 'GET',
    }),

  validateCoupon: (code, subtotal) =>
    fetchClient('/promotions/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    }),

  // Admin
  getAllPromotions: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    if (params.fundingSource) query.append('fundingSource', params.fundingSource);
    const qs = query.toString();
    return fetchClient(`/admin/promotions${qs ? `?${qs}` : ''}`, {
      method: 'GET',
    });
  },

  createPromotion: (data) =>
    fetchClient('/admin/promotions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updatePromotion: (id, data) =>
    fetchClient(`/admin/promotions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deletePromotion: (id) =>
    fetchClient(`/admin/promotions/${id}`, {
      method: 'DELETE',
    }),

  // Seller
  getSellerPromotions: () =>
    fetchClient('/seller/promotions', {
      method: 'GET',
    }),

  createSellerPromotion: (data) =>
    fetchClient('/seller/promotions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateSellerPromotion: (id, data) =>
    fetchClient(`/seller/promotions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteSellerPromotion: (id) =>
    fetchClient(`/seller/promotions/${id}`, {
      method: 'DELETE',
    }),
};
