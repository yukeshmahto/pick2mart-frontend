import { fetchClient } from './apiClient';

export const deliveryService = {
  // --------------------------------------------------------------------------
  // CUSTOMER TRACKING
  // --------------------------------------------------------------------------
  trackOrder: (orderIdOrNumber) =>
    fetchClient(`/delivery/tracking/${encodeURIComponent(orderIdOrNumber)}`, {
      method: 'GET',
    }),

  // --------------------------------------------------------------------------
  // DELIVERY PARTNER WORKFLOW
  // --------------------------------------------------------------------------
  getDashboard: () =>
    fetchClient('/delivery/dashboard', {
      method: 'GET',
    }),

  getDeliveries: (status = '', page = 1, limit = 20) => {
    let url = `/delivery/deliveries?page=${page}&limit=${limit}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    return fetchClient(url, { method: 'GET' });
  },

  getDeliveryById: (id) =>
    fetchClient(`/delivery/deliveries/${id}`, {
      method: 'GET',
    }),

  acceptDelivery: (id) =>
    fetchClient(`/delivery/deliveries/${id}/accept`, {
      method: 'PATCH',
    }),

  pickupDelivery: (id) =>
    fetchClient(`/delivery/deliveries/${id}/pickup`, {
      method: 'PATCH',
    }),

  outForDelivery: (id) =>
    fetchClient(`/delivery/deliveries/${id}/out-for-delivery`, {
      method: 'PATCH',
    }),

  resendOtp: (id) =>
    fetchClient(`/delivery/deliveries/${id}/resend-otp`, {
      method: 'POST',
    }),

  verifyOtpAndComplete: (id, data) =>
    fetchClient(`/delivery/deliveries/${id}/verify-otp`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  failDelivery: (id, data) =>
    fetchClient(`/delivery/deliveries/${id}/fail`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getProfile: () =>
    fetchClient('/delivery/profile', {
      method: 'GET',
    }),

  updateProfile: (data) =>
    fetchClient('/delivery/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // --------------------------------------------------------------------------
  // SELLER SUB-ORDER DELIVERY VIEW
  // --------------------------------------------------------------------------
  getSellerOrderDelivery: (sellerOrderId) =>
    fetchClient(`/delivery/seller-orders/${sellerOrderId}`, {
      method: 'GET',
    }),

  // --------------------------------------------------------------------------
  // ADMIN DISPATCH & FLEET WORKFLOW
  // --------------------------------------------------------------------------
  getPartnersAdmin: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    return fetchClient(`/admin/deliveries/partners?${query.toString()}`, {
      method: 'GET',
    });
  },

  createPartnerAdmin: (data) =>
    fetchClient('/admin/deliveries/partners', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updatePartnerStatusAdmin: (userId, isActive) =>
    fetchClient(`/admin/deliveries/partners/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),

  getEligibleOrdersAdmin: () =>
    fetchClient('/admin/deliveries/eligible-orders', {
      method: 'GET',
    }),

  assignDeliveryAdmin: (data) =>
    fetchClient('/admin/deliveries/assign', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  reassignDeliveryAdmin: (id, data) =>
    fetchClient(`/admin/deliveries/${id}/reassign`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAllAssignmentsAdmin: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.partnerId) query.set('partnerId', params.partnerId);
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    return fetchClient(`/admin/deliveries?${query.toString()}`, {
      method: 'GET',
    });
  },
};
