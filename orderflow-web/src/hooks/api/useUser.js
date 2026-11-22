import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userApi } from '../../api/userApi';
import { queryKeys } from '../../config/queryKeys';
import { useAuthStore } from '../../stores/authStore';

export function useProfile() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: queryKeys.user.profile,
    queryFn: () => userApi.getProfile(),
    enabled: !!isAuthenticated,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (data) => userApi.updateProfile(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.user.profile, updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
      if (updated) {
        setUser(updated);
      }
      toast.success('Profile updated successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    },
  });
}

export function useAddresses() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: queryKeys.user.addresses,
    queryFn: () => userApi.getAddresses(),
    enabled: !!isAuthenticated,
  });
}

export function useAddAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => userApi.addAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.addresses });
      toast.success('Address added successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to add address');
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => userApi.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.addresses });
      toast.success('Address updated successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update address');
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => userApi.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.addresses });
      toast.success('Address deleted successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete address');
    },
  });
}

// Admin hooks
export function useAdminUsers(params = {}) {
  return useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: () => userApi.getAllUsers(params),
  });
}

export function useAdminUserDetail(id) {
  return useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: () => userApi.getUserById(id),
    enabled: !!id,
  });
}
