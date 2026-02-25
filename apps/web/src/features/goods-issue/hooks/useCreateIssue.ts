'use client';

import { useCreateIssue as useCreateIssueMutation } from '../api/issue.api';
import type { CreateIssueDto, GoodsIssue } from '../types/issue.types';

export const useCreateIssue = () => {
  const createIssueMutation = useCreateIssueMutation();

  const createIssue = async (data: CreateIssueDto) => {
    try {
      const response = await createIssueMutation.mutateAsync(data);
      return response;
    } catch (error) {
      throw error;
    }
  };

  return {
    createIssue,
    isPending: createIssueMutation.isPending,
    error: createIssueMutation.error,
    isSuccess: createIssueMutation.isSuccess,
  };
};