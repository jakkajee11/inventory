'use client';

import { useCancelIssue as useCancelIssueMutation } from '../api/issue.api';
import type { GoodsIssue } from '../types/issue.types';

export const useCancelIssue = () => {
  const cancelIssueMutation = useCancelIssueMutation();

  const cancelIssue = async ({ id, reason }: { id: string; reason: string }) => {
    try {
      const response = await cancelIssueMutation.mutateAsync({ id, reason });
      return response;
    } catch (error) {
      throw error;
    }
  };

  return {
    cancelIssue,
    isPending: cancelIssueMutation.isPending,
    error: cancelIssueMutation.error,
    isSuccess: cancelIssueMutation.isSuccess,
  };
};