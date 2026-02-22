import { useState, useMemo } from 'react';
import { useProducts as useProductsQuery } from '../api/product.api';
import type { ProductQuery } from '../types/product.types';

export const useProducts = (initialQuery: ProductQuery = {}) => {
  const [query, setQuery] = useState<ProductQuery>({
    page: 1,
    limit: 20,
    ...initialQuery,
  });

  const { data, isLoading, error, refetch } = useProductsQuery(query);

  const handlers = useMemo(() => ({
    setPage: (page: number) => setQuery((prev) => ({ ...prev, page })),
    setLimit: (limit: number) => setQuery((prev) => ({ ...prev, limit, page: 1 })),
    setSearch: (search: string) => setQuery((prev) => ({ ...prev, search, page: 1 })),
    setCategory: (categoryId: string) => setQuery((prev) => ({ ...prev, categoryId, page: 1 })),
    toggleInactive: () => setQuery((prev) => ({ ...prev, includeInactive: !prev.includeInactive })),
    reset: () => setQuery({ page: 1, limit: 20 }),
  }), []);

  return {
    products: data?.products ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    limit: data?.limit ?? 20,
    totalPages: data?.totalPages ?? 0,
    isLoading,
    error,
    query,
    refetch,
    ...handlers,
  };
};
