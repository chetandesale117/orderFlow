import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { orderApi } from '../../api/orderApi';
import { queryKeys } from '../../config/queryKeys';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';

const ACTIVE_SAGA_STATUSES = [
  'PENDING',
  'STOCK_RESERVING',
  'STOCK_RESERVED',
  'PAYMENT_PROCESSING',
  'PAYMENT_COMPLETED',
  'PROCESSING',
];

export function useOrders(params = {}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: queryKeys.orders.list(params),
    queryFn: () => orderApi.getOrders(params),
    enabled: !!isAuthenticated,
  });
}

export function useOrder(id) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => orderApi.getOrderById(id),
    enabled: !!isAuthenticated && !!id,
    refetchInterval: (query) => {
      const data = query?.state?.data;
      if (!data) return 2500;
      const status = data.status || data.orderStatus;
      if (ACTIVE_SAGA_STATUSES.includes(status)) {
        return 2500; // Poll while Saga is actively executing
      }
      return false; // Stop polling on terminal states (CONFIRMED, SHIPPED, DELIVERED, CANCELLED, FAILED)
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const clearCart = useCartStore((s) => s.clearCart);

  return useMutation({
    mutationFn: (data) => orderApi.createOrder(data),
    onSuccess: (order) => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      toast.success('Order placed successfully! Initializing processing...');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to place order');
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => orderApi.cancelOrder(id, reason),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(vars.id) });
      toast.info('Order cancellation requested');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    },
  });
}

export function useAdminOrders(params = {}) {
  return useQuery({
    queryKey: queryKeys.admin.orders(params),
    queryFn: () => orderApi.getAllOrders(params),
  });
}

export function useAdminUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => orderApi.updateOrderStatus(id, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(vars.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success('Order status updated');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    },
  });
}
