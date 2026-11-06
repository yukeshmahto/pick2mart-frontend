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

export const productService = {
  getPublicProducts: (params) =>
    fetchClient(`/products${buildQueryString(params)}`, {
      method: 'GET',
    }),

  getProductById: (id) =>
    fetchClient(`/products/${id}`, {
      method: 'GET',
    }),

  getProductVariants: (productId) =>
    fetchClient(`/products/${productId}/variants`, {
      method: 'GET',
    }),

  getBrands: () =>
    fetchClient('/products/brands', {
      method: 'GET',
    }),
};
