import api from './axiosInstance';

export const orderApi = {
  createOrder: (data) => api.post('/api/v1/orders', data),
  getOrders: (params) => api.get('/api/v1/orders', { params }),
  getOrderById: (id) => api.get(`/api/v1/orders/${id}`),
  cancelOrder: (id, reason) =>
    api.post(`/api/v1/orders/${id}/cancel`, null, { params: { reason } }),
  // Admin
  getAllOrders: (params) => api.get('/api/v1/admin/orders', { params }),
  updateOrderStatus: (id, data) => api.put(`/api/v1/admin/orders/${id}/status`, data),
};
