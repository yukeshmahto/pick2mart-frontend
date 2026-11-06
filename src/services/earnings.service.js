import { fetchClient } from './apiClient';

export const earningsService = {
  // Seller Endpoints
  getSellerSummary: () => fetchClient('/seller/earnings/summary'),

  getSellerLedger: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.status) query.append('status', params.status);
    if (params.dateFrom) query.append('dateFrom', params.dateFrom);
    if (params.dateTo) query.append('dateTo', params.dateTo);
    const qs = query.toString();
    return fetchClient(`/seller/earnings/ledger${qs ? `?${qs}` : ''}`);
  },

  getSellerPayouts: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.status) query.append('status', params.status);
    const qs = query.toString();
    return fetchClient(`/seller/earnings/payouts${qs ? `?${qs}` : ''}`);
  },

  requestPayout: (payoutData) =>
    fetchClient('/seller/earnings/payouts/request', {
      method: 'POST',
      body: JSON.stringify(payoutData),
    }),

  // Admin Endpoints
  getAdminSummary: () => fetchClient('/admin/earnings/summary'),

  getAdminLedger: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.sellerId) query.append('sellerId', params.sellerId);
    if (params.status) query.append('status', params.status);
    const qs = query.toString();
    return fetchClient(`/admin/earnings/ledger${qs ? `?${qs}` : ''}`);
  },

  getCommissionRules: (params = {}) => {
    const query = new URLSearchParams();
    if (params.scope) query.append('scope', params.scope);
    if (params.sellerId) query.append('sellerId', params.sellerId);
    const qs = query.toString();
    return fetchClient(`/admin/earnings/rules${qs ? `?${qs}` : ''}`);
  },

  createCommissionRule: (ruleData) =>
    fetchClient('/admin/earnings/rules', {
      method: 'POST',
      body: JSON.stringify(ruleData),
    }),

  updateCommissionRule: (ruleId, updateData) =>
    fetchClient(`/admin/earnings/rules/${ruleId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    }),

  getAdminPayouts: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.status) query.append('status', params.status);
    if (params.sellerId) query.append('sellerId', params.sellerId);
    const qs = query.toString();
    return fetchClient(`/admin/earnings/payouts${qs ? `?${qs}` : ''}`);
  },

  reviewPayout: (payoutId, reviewData) =>
    fetchClient(`/admin/earnings/payouts/${payoutId}/review`, {
      method: 'PATCH',
      body: JSON.stringify(reviewData),
    }),

  recordPayoutPaid: (payoutId, paidData) =>
    fetchClient(`/admin/earnings/payouts/${payoutId}/record-paid`, {
      method: 'PATCH',
      body: JSON.stringify(paidData),
    }),

  confirmCodRemittance: (sellerOrderId) =>
    fetchClient(`/admin/earnings/cod-remit/${sellerOrderId}`, {
      method: 'PATCH',
    }),
};
