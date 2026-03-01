import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/api-client';
import type { Category, CategoryQuery, CategoryListResponse, CreateCategoryData, UpdateCategoryData } from '../types/category.types';

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (query: CategoryQuery) => [...categoryKeys.lists(), query] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
  tree: () => [...categoryKeys.all, 'tree'] as const,
};

export const useCategories = (query: CategoryQuery = {}) => {
  return useQuery({
    queryKey: categoryKeys.list(query),
    queryFn: async (): Promise<CategoryListResponse> => {
      const params = new URLSearchParams();
      if (query.page) params.append('page', String(query.page));
      if (query.limit) params.append('limit', String(query.limit));
      if (query.search) params.append('search', query.search);
      if (query.includeInactive) params.append('includeInactive', 'true');

      const { data } = await apiClient.get(`/categories?${params.toString()}`);
      return data;
    },
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: async (): Promise<Category> => {
      const { data } = await apiClient.get(`/categories/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCategoryTree = (includeInactive = false) => {
  return useQuery({
    queryKey: [...categoryKeys.tree(), includeInactive],
    queryFn: async (): Promise<Category[]> => {
      const { data } = await apiClient.get(`/categories/tree?includeInactive=${includeInactive}`);
      return data;
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: CreateCategoryData): Promise<Category> => {
      const { data } = await apiClient.post('/categories', category);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCategoryData }): Promise<Category> => {
      const { data: response } = await apiClient.put(`/categories/${id}`, data);
      return response;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
    },
  });
};
