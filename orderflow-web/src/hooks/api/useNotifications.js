import { useQuery } from '@tanstack/react-query';
import { notificationApi } from '../../api/notificationApi';
import { queryKeys } from '../../config/queryKeys';
import { useAuthStore } from '../../stores/authStore';

export function useNotifications(params = {}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => notificationApi.getNotifications(params),
    enabled: !!isAuthenticated,
    refetchInterval: 15000,
  });
}

export function useNotificationDetail(id) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['notifications', id],
    queryFn: () => notificationApi.getNotificationById(id),
    enabled: !!isAuthenticated && !!id,
  });
}

export function useAdminNotifications(params = {}) {
  return useQuery({
    queryKey: ['admin', 'notifications', params],
    queryFn: () => notificationApi.getAllNotifications(params),
  });
}
