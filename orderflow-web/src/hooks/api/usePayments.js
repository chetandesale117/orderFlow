import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { paymentApi } from '../../api/paymentApi';
import { queryKeys } from '../../config/queryKeys';

export function usePaymentForOrder(orderId) {
  return useQuery({
    queryKey: ['payments', 'order', orderId],
    queryFn: () => paymentApi.getPaymentForOrder(orderId),
    enabled: !!orderId,
  });
}

export function useAdminPayments(params = {}) {
  return useQuery({
    queryKey: queryKeys.admin.payments(params),
    queryFn: () => paymentApi.getAllPayments(params),
  });
}

export function useAdminRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => paymentApi.refund(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success('Refund processed successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to process refund');
    },
  });
}
