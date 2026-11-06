import { fetchClient } from './apiClient';

const buildQueryString = (params = {}) => {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  }
  const str = query.toString();
  return str ? `?${str}` : '';
};

export const adminService = {
  // Dashboard
  getDashboardStats: () =>
    fetchClient('/admin/dashboard', {
      method: 'GET',
    }),

  // Users
  getAllUsers: (params) =>
    fetchClient(`/admin/users${buildQueryString(params)}`, {
      method: 'GET',
    }),

  getUserById: (id) =>
    fetchClient(`/admin/users/${id}`, {
      method: 'GET',
    }),

  updateUserStatus: (id, isActive) =>
    fetchClient(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),

  updateUserRole: (id, role) =>
    fetchClient(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),

  // Sellers
  getAllSellers: () =>
    fetchClient('/admin/sellers', {
      method: 'GET',
    }),

  getSellerById: (id) =>
    fetchClient(`/admin/sellers/${id}`, {
      method: 'GET',
    }),

  updateSellerApproval: (id, isApproved) =>
    fetchClient(`/admin/sellers/${id}/approval`, {
      method: 'PATCH',
      body: JSON.stringify({ isApproved }),
    }),

  updateSellerStatus: (id, isActive) =>
    fetchClient(`/admin/sellers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),

  // Products
  getAllProducts: (params) =>
    fetchClient(`/admin/products${buildQueryString(params)}`, {
      method: 'GET',
    }),

  getProductById: (id) =>
    fetchClient(`/admin/products/${id}`, {
      method: 'GET',
    }),

  createProduct: (data) =>
    fetchClient('/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProduct: (id, data) =>
    fetchClient(`/admin/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteProduct: (id) =>
    fetchClient(`/admin/products/${id}`, {
      method: 'DELETE',
    }),

  updateProductApproval: (id, isApproved, rejectionReason = '') =>
    fetchClient(`/admin/products/${id}/approval`, {
      method: 'PATCH',
      body: JSON.stringify({ isApproved, rejectionReason }),
    }),

  updateProductStatus: (id, isActive, status) =>
    fetchClient(`/admin/products/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive, status }),
    }),

  // Orders
  getAllOrders: (params) =>
    fetchClient(`/admin/orders${buildQueryString(params)}`, {
      method: 'GET',
    }),

  getOrderById: (id) =>
    fetchClient(`/admin/orders/${id}`, {
      method: 'GET',
    }),

  updateOrderStatus: (id, status, paymentStatus) =>
    fetchClient(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, paymentStatus }),
    }),

  getAllSellerOrders: (params) =>
    fetchClient(`/admin/orders/seller-orders${buildQueryString(params)}`, {
      method: 'GET',
    }),

  updateSellerOrderStatus: (id, status) =>
    fetchClient(`/admin/orders/seller-orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Inventory
  getAllInventory: (params) =>
    fetchClient(`/admin/inventory${buildQueryString(params)}`, {
      method: 'GET',
    }),

  adjustInventory: (variantId, data) =>
    fetchClient(`/admin/inventory/${variantId}/adjust`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Carts & Wishlists
  getAllCarts: (params) =>
    fetchClient(`/admin/carts${buildQueryString(params)}`, {
      method: 'GET',
    }),

  getAllWishlists: (params) =>
    fetchClient(`/admin/wishlists${buildQueryString(params)}`, {
      method: 'GET',
    }),

  // Activity Logs
  getActivityLogs: (params) =>
    fetchClient(`/admin/activity-logs${buildQueryString(params)}`, {
      method: 'GET',
    }),
};
