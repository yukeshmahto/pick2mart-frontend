import { fetchClient } from './apiClient';

export const returnsService = {
  // --------------------------------------------------------------------------
  // CUSTOMER APIS
  // --------------------------------------------------------------------------
  cancelOrder: (orderId, { reason, sellerOrderId = null }) =>
    fetchClient(`/orders/${orderId}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason, sellerOrderId }),
    }),

  createReturnRequest: (data) =>
    fetchClient('/customer/returns', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMyReturns: (status = '', page = 1, limit = 10) => {
    let url = `/customer/returns?page=${page}&limit=${limit}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    return fetchClient(url, { method: 'GET' });
  },

  getMyRefunds: () =>
    fetchClient('/customer/refunds', {
      method: 'GET',
    }),

  getPublicPolicy: () =>
    fetchClient('/returns/policy', {
      method: 'GET',
    }),

  // --------------------------------------------------------------------------
  // SELLER APIS
  // --------------------------------------------------------------------------
  getSellerReturns: (status = '', page = 1, limit = 20) => {
    let url = `/seller/returns?page=${page}&limit=${limit}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    return fetchClient(url, { method: 'GET' });
  },

  reviewSellerReturn: (returnId, { action, rejectionReason }) =>
    fetchClient(`/seller/returns/${returnId}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ action, rejectionReason }),
    }),

  scheduleSellerPickup: (returnId, data) =>
    fetchClient(`/seller/returns/${returnId}/pickup`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  inspectSellerReturn: (returnId, { outcome, inspectionNotes }) =>
    fetchClient(`/seller/returns/${returnId}/inspect`, {
      method: 'PATCH',
      body: JSON.stringify({ outcome, inspectionNotes }),
    }),

  // --------------------------------------------------------------------------
  // ADMIN APIS
  // --------------------------------------------------------------------------
  getAdminReturns: (status = '', sellerId = '', page = 1, limit = 20) => {
    let url = `/admin/returns?page=${page}&limit=${limit}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    if (sellerId) url += `&sellerId=${encodeURIComponent(sellerId)}`;
    return fetchClient(url, { method: 'GET' });
  },

  reviewAdminReturn: (returnId, { action, rejectionReason }) =>
    fetchClient(`/admin/returns/${returnId}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ action, rejectionReason }),
    }),

  scheduleAdminPickup: (returnId, data) =>
    fetchClient(`/admin/returns/${returnId}/pickup`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  inspectAdminReturn: (returnId, { outcome, inspectionNotes }) =>
    fetchClient(`/admin/returns/${returnId}/inspect`, {
      method: 'PATCH',
      body: JSON.stringify({ outcome, inspectionNotes }),
    }),

  getAdminRefunds: (status = '', originType = '', page = 1, limit = 20) => {
    let url = `/admin/refunds?page=${page}&limit=${limit}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    if (originType) url += `&originType=${encodeURIComponent(originType)}`;
    return fetchClient(url, { method: 'GET' });
  },

  recordRefundCompleted: (refundId, data) =>
    fetchClient(`/admin/refunds/${refundId}/record-completed`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getReturnPolicy: () =>
    fetchClient('/admin/returns/policy', {
      method: 'GET',
    }),

  updateReturnPolicy: (data) =>
    fetchClient('/admin/returns/policy', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
