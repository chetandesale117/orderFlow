import api from './axiosInstance';

export const authApi = {
  register: (data) => api.post('/api/v1/auth/register', data),
  login: (data) => api.post('/api/v1/auth/login', data),
  refresh: (data) => api.post('/api/v1/auth/refresh', data),
  logout: () => api.post('/api/v1/auth/logout'),
  me: () => api.get('/api/v1/auth/me'),
  createAdmin: (data) => api.post('/api/v1/auth/admin/users', data),
};
