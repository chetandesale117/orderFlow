import api from './axiosInstance';

export const productApi = {
  getProducts: (params) => api.get('/api/v1/products', { params }),
  getProductById: (id) => api.get(`/api/v1/products/${id}`),
  getProductBySlug: (slug) => api.get(`/api/v1/products/slug/${slug}`),
  getCategories: () => api.get('/api/v1/categories'),
  // Admin
  createProduct: (data) => api.post('/api/v1/admin/products', data),
  updateProduct: (id, data) => api.put(`/api/v1/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/api/v1/admin/products/${id}`),
  createCategory: (data) => api.post('/api/v1/admin/categories', data),
  updateCategory: (id, data) => api.put(`/api/v1/admin/categories/${id}`, data),
};
