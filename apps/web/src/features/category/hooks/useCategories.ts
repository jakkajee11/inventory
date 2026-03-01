import { useState, useCallback } from 'react';
import { useCategories as useCategoriesQuery } from '../api/category.api';
import type { CategoryQuery } from '../types/category.types';

export function useCategoriesList(initialQuery?: CategoryQuery) {
  const [query, setQuery] = useState<CategoryQuery>({
    page: 1,
    limit: 20,
    ...initialQuery,
  });

  const { data, isLoading, refetch } = useCategoriesQuery(query);

  const setPage = useCallback((page: number) => {
    setQuery((prev) => ({ ...prev, page }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setQuery((prev) => ({ ...prev, search: search || undefined, page: 1 }));
  }, []);

  const toggleInactive = useCallback(() => {
    setQuery((prev) => ({ ...prev, includeInactive: !prev.includeInactive, page: 1 }));
  }, []);

  return {
    categories: data?.categories ?? [],
    total: data?.total ?? 0,
    page: query.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    isLoading,
    query,
    setPage,
    setSearch,
    toggleInactive,
    refetch,
  };
}
