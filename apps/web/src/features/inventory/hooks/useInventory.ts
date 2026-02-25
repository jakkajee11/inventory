import { useState, useMemo } from 'react';
import { useInventory as useInventoryQuery } from '../api/inventory.api';
import type { InventoryFilters, InventoryItem } from '../types/inventory.types';

export const useInventory = (initialFilters: InventoryFilters = {}) => {
  const [filters, setFilters] = useState<InventoryFilters>({
    page: 1,
    limit: 20,
    ...initialFilters,
  });

  const { data, isLoading, error, refetch } = useInventoryQuery(filters);

  const handlers = useMemo(() => ({
    setSearch: (search: string) => setFilters((prev) => ({ ...prev, search, page: 1 })),
    setCategory: (categoryId: string) => setFilters((prev) => ({ ...prev, categoryId, page: 1 })),
    setStockStatus: (stockStatus: 'all' | 'low' | 'out' | 'normal') =>
      setFilters((prev) => ({ ...prev, stockStatus, page: 1 })),
    setPage: (page: number) => setFilters((prev) => ({ ...prev, page })),
    setLimit: (limit: number) => setFilters((prev) => ({ ...prev, limit, page: 1 })),
    reset: () => setFilters({ page: 1, limit: 20 }),
    refresh: () => refetch(),
  }), []);

  return {
    items: data?.items ?? [],
    total: data?.pagination.total ?? 0,
    page: data?.pagination.page ?? 1,
    limit: data?.pagination.limit ?? 20,
    totalPages: data?.pagination.totalPages ?? 0,
    isLoading,
    error,
    filters,
    refetch,
    ...handlers,
  };
};

export const useProductMovements = (productId: string, page = 1, limit = 20) => {
  const { data, isLoading, error, refetch } = useInventoryQuery.useProductMovements(productId, page, limit);

  return {
    movements: data?.items ?? [],
    total: data?.pagination.total ?? 0,
    page: data?.pagination.page ?? 1,
    limit: data?.pagination.limit ?? 20,
    totalPages: data?.pagination.totalPages ?? 0,
    isLoading,
    error,
    refetch,
  };
};