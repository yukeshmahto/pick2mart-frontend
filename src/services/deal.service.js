import { apiClient } from './apiClient';

export const dealService = {
  getActiveFlashDeals: async () => {
    return apiClient.get('/deals/flash');
  },

  getActiveDeals: async () => {
    return apiClient.get('/deals/active');
  },

  getAllDealsAdmin: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search) query.append('search', params.search);
    if (params.isFlashDeal !== undefined && params.isFlashDeal !== '') {
      query.append('isFlashDeal', params.isFlashDeal);
    }
    if (params.status) query.append('status', params.status);

    const queryString = query.toString();
    return apiClient.get(`/deals/admin${queryString ? `?${queryString}` : ''}`);
  },

  getDealById: async (id) => {
    return apiClient.get(`/deals/${id}`);
  },

  createDeal: async (data) => {
    return apiClient.post('/deals', data);
  },

  updateDeal: async (id, data) => {
    return apiClient.patch(`/deals/${id}`, data);
  },

  deleteDeal: async (id) => {
    return apiClient.delete(`/deals/${id}`);
  },
};
