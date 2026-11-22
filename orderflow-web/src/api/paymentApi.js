import api from './axiosInstance';

export const paymentApi = {
  getPaymentForOrder: (orderId) => api.get(`/api/v1/payments/order/${orderId}`),
  // Admin
  getAllPayments: (params) => api.get('/api/v1/admin/payments', { params }),
  refund: (id, data) => api.post(`/api/v1/admin/payments/${id}/refund`, data),
};
