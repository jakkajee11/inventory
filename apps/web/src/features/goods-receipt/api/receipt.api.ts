import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/api-client';
import type { GoodsReceipt, CreateReceiptDto, UpdateReceiptDto, ReceiptListResponse } from '../types/receipt.types';

export const receiptKeys = {
  all: ['receipts'] as const,
  lists: () => [...receiptKeys.all, 'list'] as const,
  list: (filters: { page?: number; status?: string }) => [...receiptKeys.lists(), filters] as const,
  detail: (id: string) => [...receiptKeys.all, 'detail', id] as const,
};

export function useReceipts(page = 1, status?: string) {
  return useQuery({
    queryKey: receiptKeys.list({ page, status }),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (status) params.append('status', status);
      
      const { data } = await apiClient.get(`/goods-receipts?${params.toString()}`);
      return data as ReceiptListResponse;
    },
  });
}

export function useReceipt(id: string) {
  return useQuery({
    queryKey: receiptKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get(`/goods-receipts/${id}`);
      return data as GoodsReceipt;
    },
    enabled: !!id,
  });
}

export function useCreateReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateReceiptDto) => {
      const { data } = await apiClient.post('/goods-receipts', dto);
      return data as GoodsReceipt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: receiptKeys.lists() });
    },
  });
}

export function useUpdateReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data: dto }: { id: string; data: UpdateReceiptDto }) => {
      const { data } = await apiClient.put(`/goods-receipts/${id}`, dto);
      return data as GoodsReceipt;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: receiptKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: receiptKeys.lists() });
    },
  });
}

export function useDeleteReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/goods-receipts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: receiptKeys.lists() });
    },
  });
}

export function useSubmitReceipt() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post(`/goods-receipts/${id}/submit`);
      return data as GoodsReceipt;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: receiptKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: receiptKeys.lists() });
    },
  });
}

export function useApproveReceipt() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post(`/goods-receipts/${id}/approve`);
      return data as GoodsReceipt;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: receiptKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: receiptKeys.lists() });
    },
  });
}

export function useCancelReceipt() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data } = await apiClient.post(`/goods-receipts/${id}/cancel`, { reason });
      return data as GoodsReceipt;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: receiptKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: receiptKeys.lists() });
    },
  });
}
