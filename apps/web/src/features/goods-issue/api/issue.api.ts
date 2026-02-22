import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/api-client';
import type { GoodsIssue, CreateIssueDto, IssueListResponse } from '../types/issue.types';

export const issueKeys = {
  all: ['issues'] as const,
  lists: () => [...issueKeys.all, 'list'] as const,
  list: (filters: { page?: number; status?: string }) => [...issueKeys.lists(), filters] as const,
  detail: (id: string) => [...issueKeys.all, 'detail', id] as const,
};

export function useIssues(page = 1, status?: string) {
  return useQuery({
    queryKey: issueKeys.list({ page, status }),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (status) params.append('status', status);

      const { data } = await apiClient.get(`/goods-issues?${params.toString()}`);
      return data as IssueListResponse;
    },
  });
}

export function useIssue(id: string) {
  return useQuery({
    queryKey: issueKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get(`/goods-issues/${id}`);
      return data as GoodsIssue;
    },
    enabled: !!id,
  });
}

export function useCreateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateIssueDto) => {
      const { data } = await apiClient.post('/goods-issues', dto);
      return data as GoodsIssue;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: issueKeys.lists() });
    },
  });
}

export function useSubmitIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post(`/goods-issues/${id}/submit`);
      return data as GoodsIssue;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: issueKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: issueKeys.lists() });
    },
  });
}

export function useApproveIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post(`/goods-issues/${id}/approve`);
      return data as GoodsIssue;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: issueKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: issueKeys.lists() });
    },
  });
}

export function useCancelIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data } = await apiClient.post(`/goods-issues/${id}/cancel`, { reason });
      return data as GoodsIssue;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: issueKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: issueKeys.lists() });
    },
  });
}
