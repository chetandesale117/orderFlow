import api from './axiosInstance';

export const notificationApi = {
  getNotifications: (params) => api.get('/api/v1/notifications', { params }),
  getNotificationById: (id) => api.get(`/api/v1/notifications/${id}`),
  // Admin
  getAllNotifications: (params) => api.get('/api/v1/admin/notifications', { params }),
};
