import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productApi } from '../../api/productApi';
import { queryKeys } from '../../config/queryKeys';

export function useProducts(params = {}) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => productApi.getProducts(params),
    keepPreviousData: true,
  });
}

export function useProduct(id) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => productApi.getProductById(id),
    enabled: !!id,
  });
}

export function useProductBySlug(slug) {
  return useQuery({
    queryKey: ['products', 'slug', slug],
    queryFn: () => productApi.getProductBySlug(slug),
    enabled: !!slug,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => productApi.getCategories(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useAdminCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => productApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      toast.success('Product created successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create product');
    },
  });
}

export function useAdminUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => productApi.updateProduct(id, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(vars.id) });
      toast.success('Product updated successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update product');
    },
  });
}

export function useAdminDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => productApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      toast.success('Product deleted successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    },
  });
}

export function useAdminCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => productApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      toast.success('Category created successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create category');
    },
  });
}

export function useAdminUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => productApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      toast.success('Category updated successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update category');
    },
  });
}
