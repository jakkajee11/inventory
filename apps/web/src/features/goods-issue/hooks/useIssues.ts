import { useState, useMemo } from 'react';
import { useIssues as useIssuesQuery } from '../api/issue.api';
import type { IssueListResponse } from '../types/issue.types';

export const useIssues = (initialQuery: { page?: number; status?: string } = {}) => {
  const [query, setQuery] = useState(initialQuery);

  const { data, isLoading, error, refetch } = useIssuesQuery(query.page || 1, query.status);

  const handlers = useMemo(() => ({
    setPage: (page: number) => setQuery((prev) => ({ ...prev, page })),
    setStatus: (status?: string) => setQuery((prev) => ({ ...prev, status, page: 1 })),
    reset: () => setQuery({}),
  }), []);

  return {
    issues: data?.issues ?? [],
    pagination: data?.pagination ?? {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
    isLoading,
    error,
    refetch,
    query,
    ...handlers,
  };
};