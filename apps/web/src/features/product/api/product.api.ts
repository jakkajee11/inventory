import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/api-client';
import type { Product, ProductQuery, ProductListResponse, CreateProductData, UpdateProductData } from '../types/product.types';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (query: ProductQuery) => [...productKeys.lists(), query] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

export const useProducts = (query: ProductQuery = {}) => {
  return useQuery({
    queryKey: productKeys.list(query),
    queryFn: async (): Promise<ProductListResponse> => {
      const params = new URLSearchParams();
      if (query.page) params.append('page', String(query.page));
      if (query.limit) params.append('limit', String(query.limit));
      if (query.search) params.append('search', query.search);
      if (query.categoryId) params.append('categoryId', query.categoryId);
      if (query.includeInactive) params.append('includeInactive', 'true');
      
      const { data } = await apiClient.get(`/products?${params.toString()}`);
      return data;
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async (): Promise<Product> => {
      const { data } = await apiClient.get(`/products/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: CreateProductData): Promise<Product> => {
      const { data } = await apiClient.post('/products', product);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProductData }): Promise<Product> => {
      const { data: response } = await apiClient.put(`/products/${id}?version=${data.version}`, data);
      return response;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};
