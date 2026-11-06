import { fetchClient } from './apiClient';

export const sellerService = {
  // Dashboard Metrics
  getDashboard: () =>
    fetchClient('/seller/dashboard', {
      method: 'GET',
    }),

  // Profile Management
  createProfile: (data) =>
    fetchClient('/seller/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProfile: () =>
    fetchClient('/seller/profile', {
      method: 'GET',
    }),

  updateProfile: (data) =>
    fetchClient('/seller/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Orders Management
  getOrders: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.status) query.append('status', params.status);
    const queryString = query.toString();
    return fetchClient(`/seller/orders${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },

  getOrderById: (orderId) =>
    fetchClient(`/seller/orders/${orderId}`, {
      method: 'GET',
    }),

  updateOrderStatus: (orderId, data) =>
    fetchClient(`/seller/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Products Management
  getProducts: () =>
    fetchClient('/seller/products', {
      method: 'GET',
    }),

  getProductById: (id) =>
    fetchClient(`/seller/products/${id}`, {
      method: 'GET',
    }),

  createProduct: (data) =>
    fetchClient('/seller/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProduct: (id, data) =>
    fetchClient(`/seller/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteProduct: (id) =>
    fetchClient(`/seller/products/${id}`, {
      method: 'DELETE',
    }),

  // Variants & Inventory Management
  getVariants: (productId) =>
    fetchClient(`/seller/products/${productId}/variants`, {
      method: 'GET',
    }),

  getVariantById: (productId, variantId) =>
    fetchClient(`/seller/products/${productId}/variants/${variantId}`, {
      method: 'GET',
    }),

  createVariant: (productId, data) =>
    fetchClient(`/seller/products/${productId}/variants`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateVariant: (productId, variantId, data) =>
    fetchClient(`/seller/products/${productId}/variants/${variantId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteVariant: (productId, variantId) =>
    fetchClient(`/seller/products/${productId}/variants/${variantId}`, {
      method: 'DELETE',
    }),

  getInventory: (productId, variantId) =>
    fetchClient(`/seller/products/${productId}/variants/${variantId}/inventory`, {
      method: 'GET',
    }),

  updateInventory: (productId, variantId, data) =>
    fetchClient(`/seller/products/${productId}/variants/${variantId}/inventory`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Supporting Catalogs
  getCategories: () =>
    fetchClient('/categories/active', {
      method: 'GET',
    }),
};
