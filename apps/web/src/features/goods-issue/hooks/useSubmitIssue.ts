'use client';

import { useSubmitIssue as useSubmitIssueMutation } from '../api/issue.api';
import type { GoodsIssue } from '../types/issue.types';

export const useSubmitIssue = () => {
  const submitIssueMutation = useSubmitIssueMutation();

  const submitIssue = async (id: string) => {
    try {
      const response = await submitIssueMutation.mutateAsync(id);
      return response;
    } catch (error) {
      throw error;
    }
  };

  return {
    submitIssue,
    isPending: submitIssueMutation.isPending,
    error: submitIssueMutation.error,
    isSuccess: submitIssueMutation.isSuccess,
  };
};