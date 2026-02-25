'use client';

import { useApproveIssue as useApproveIssueMutation } from '../api/issue.api';
import type { GoodsIssue } from '../types/issue.types';

export const useApproveIssue = () => {
  const approveIssueMutation = useApproveIssueMutation();

  const approveIssue = async (id: string) => {
    try {
      const response = await approveIssueMutation.mutateAsync(id);
      return response;
    } catch (error) {
      throw error;
    }
  };

  return {
    approveIssue,
    isPending: approveIssueMutation.isPending,
    error: approveIssueMutation.error,
    isSuccess: approveIssueMutation.isSuccess,
  };
};