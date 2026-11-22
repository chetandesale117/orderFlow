import api from './axiosInstance';

export const userApi = {
  getProfile: () => api.get('/api/v1/users/me'),
  updateProfile: (data) => api.put('/api/v1/users/me', data),
  getAddresses: () => api.get('/api/v1/users/me/addresses'),
  addAddress: (data) => api.post('/api/v1/users/me/addresses', data),
  updateAddress: (id, data) => api.put(`/api/v1/users/me/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/api/v1/users/me/addresses/${id}`),
  // Admin
  getAllUsers: (params) => api.get('/api/v1/admin/users', { params }),
  getUserById: (id) => api.get(`/api/v1/admin/users/${id}`),
};
