import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi } from '../../api/authApi';
import { useAuthStore } from '../../stores/authStore';
import { queryKeys } from '../../config/queryKeys';
import { ROUTES } from '../../config/routes';

export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (credentials) => authApi.login(credentials),
    onSuccess: (data) => {
      setAuth({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
      });
      toast.success(`Welcome back, ${data.user?.fullName || data.user?.email || 'User'}!`);
      if (data.user?.role === 'ADMIN') {
        navigate(ROUTES.ADMIN_DASHBOARD);
      } else {
        navigate(ROUTES.HOME);
      }
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (data) => authApi.register(data),
    onSuccess: (data) => {
      setAuth({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
      });
      toast.success('Registration successful! Welcome to OrderFlow.');
      navigate(ROUTES.HOME);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Registration failed. Please check your inputs.';
      toast.error(msg);
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearAuth();
      queryClient.clear();
      toast.info('You have been logged out.');
      navigate(ROUTES.LOGIN);
    },
  });
}

export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setAuth = useAuthStore((s) => s.setAuth);
  const authState = useAuthStore.getState();

  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      const res = await authApi.me();
      if (res) {
        setAuth({
          accessToken: authState.accessToken,
          refreshToken: authState.refreshToken,
          user: res,
        });
      }
      return res;
    },
    enabled: !!isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}
