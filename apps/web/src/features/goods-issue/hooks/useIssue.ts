import { useIssue as useIssueQuery } from '../api/issue.api';
import type { GoodsIssue } from '../types/issue.types';

export const useIssue = (id: string) => {
  const { data, isLoading, error, refetch } = useIssueQuery(id);

  return {
    issue: data,
    isLoading,
    error,
    refetch,
  };
};