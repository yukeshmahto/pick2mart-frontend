import { apiClient } from './apiClient';

export const newsletterService = {
  subscribe: async (email, couponCode = '', source = 'HOMEPAGE') => {
    return apiClient.post('/newsletter/subscribe', { email, couponCode, source });
  },

  unsubscribe: async (email) => {
    return apiClient.post('/newsletter/unsubscribe', { email });
  },

  getSubscribers: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);

    const queryString = query.toString();
    return apiClient.get(`/newsletter/subscribers${queryString ? `?${queryString}` : ''}`);
  },
};
