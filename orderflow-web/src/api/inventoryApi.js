import api from './axiosInstance';

export const inventoryApi = {
  getStock: (productId) => api.get(`/api/v1/inventory/${productId}`),
  getBatchStock: (productIds) =>
    api.get('/api/v1/inventory/batch', {
      params: { productIds: (productIds || []).join(',') },
    }),
  // Admin
  updateStock: (productId, data) => api.put(`/api/v1/admin/inventory/${productId}`, data),
  initInventory: (data) => api.post('/api/v1/admin/inventory', data),
};
