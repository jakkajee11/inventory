import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/api-client';
import type { StockAdjustment, CreateAdjustmentDto, AdjustmentListResponse } from '../types/adjustment.types';

export const adjustmentKeys = {
  all: ['adjustments'] as const,
  lists: () => [...adjustmentKeys.all, 'list'] as const,
  list: (filters: { page?: number; status?: string }) => [...adjustmentKeys.lists(), filters] as const,
  detail: (id: string) => [...adjustmentKeys.all, 'detail', id] as const,
};

export function useAdjustments(page = 1, status?: string) {
  return useQuery({
    queryKey: adjustmentKeys.list({ page, status }),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (status) params.append('status', status);

      const { data } = await apiClient.get(`/stock-adjustments?${params.toString()}`);
      return data as AdjustmentListResponse;
    },
  });
}

export function useAdjustment(id: string) {
  return useQuery({
    queryKey: adjustmentKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get(`/stock-adjustments/${id}`);
      return data as StockAdjustment;
    },
    enabled: !!id,
  });
}

export function useCreateAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateAdjustmentDto) => {
      const { data } = await apiClient.post('/stock-adjustments', dto);
      return data as StockAdjustment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adjustmentKeys.lists() });
    },
  });
}

export function useSubmitAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post(`/stock-adjustments/${id}/submit`);
      return data as StockAdjustment;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: adjustmentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: adjustmentKeys.lists() });
    },
  });
}

export function useApproveAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post(`/stock-adjustments/${id}/approve`);
      return data as StockAdjustment;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: adjustmentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: adjustmentKeys.lists() });
    },
  });
}

export function useCancelAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data } = await apiClient.post(`/stock-adjustments/${id}/cancel`, { reason });
      return data as StockAdjustment;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: adjustmentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: adjustmentKeys.lists() });
    },
  });
}
