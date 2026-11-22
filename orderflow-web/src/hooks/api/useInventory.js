import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { inventoryApi } from '../../api/inventoryApi';
import { queryKeys } from '../../config/queryKeys';

export function useStock(productId) {
  return useQuery({
    queryKey: queryKeys.inventory.byProduct(productId),
    queryFn: () => inventoryApi.getStock(productId),
    enabled: !!productId,
    refetchInterval: 15000,
  });
}

export function useBatchStock(productIds = []) {
  return useQuery({
    queryKey: queryKeys.inventory.batch(productIds),
    queryFn: () => inventoryApi.getBatchStock(productIds),
    enabled: Array.isArray(productIds) && productIds.length > 0,
    refetchInterval: 15000,
  });
}

export function useAdminUpdateStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, data }) => inventoryApi.updateStock(productId, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.byProduct(vars.productId) });
      toast.success('Inventory stock updated successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update stock');
    },
  });
}

export function useAdminInitInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => inventoryApi.initInventory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      toast.success('Inventory record initialized');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to initialize inventory');
    },
  });
}
