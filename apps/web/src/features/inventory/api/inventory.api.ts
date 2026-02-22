import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/api-client';
import type { InventoryFilters, InventoryListResponse, MovementHistoryResponse } from '../types/inventory.types';

export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (filters: InventoryFilters) => [...inventoryKeys.lists(), filters] as const,
  movements: (productId: string) => [...inventoryKeys.all, 'movements', productId] as const,
};

export function useInventory(filters: InventoryFilters = {}) {
  return useQuery({
    queryKey: inventoryKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.stockStatus) params.append('stockStatus', filters.stockStatus);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const { data } = await apiClient.get(`/inventory?${params.toString()}`);
      return data as InventoryListResponse;
    },
  });
}

export function useProductMovements(productId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: inventoryKeys.movements(productId),
    queryFn: async () => {
      const { data } = await apiClient.get(`/inventory/${productId}/movements?page=${page}&limit=${limit}`);
      return data as MovementHistoryResponse;
    },
    enabled: !!productId,
  });
}
