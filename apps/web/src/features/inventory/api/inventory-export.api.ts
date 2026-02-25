import { apiClient } from '@/lib/api/api-client';

export interface ExportFilter {
  categoryId?: string;
  warehouseId?: string;
  lowStockOnly?: boolean;
  includeInactive?: boolean;
}

export function exportInventoryToCSV(filter?: ExportFilter) {
  const params = new URLSearchParams();
  if (filter?.categoryId) params.append('categoryId', filter.categoryId);
  if (filter?.warehouseId) params.append('warehouseId', filter.warehouseId);
  if (filter?.lowStockOnly) params.append('lowStockOnly', filter.lowStockOnly.toString());
  if (filter?.includeInactive) params.append('includeInactive', filter.includeInactive.toString());

  const url = `/inventory/export/csv?${params.toString()}`;
  window.open(url, '_blank');
}

export function exportInventoryToExcel(filter?: ExportFilter) {
  const params = new URLSearchParams();
  if (filter?.categoryId) params.append('categoryId', filter.categoryId);
  if (filter?.warehouseId) params.append('warehouseId', filter.warehouseId);
  if (filter?.lowStockOnly) params.append('lowStockOnly', filter.lowStockOnly.toString());
  if (filter?.includeInactive) params.append('includeInactive', filter.includeInactive.toString());

  const url = `/inventory/export/excel?${params.toString()}`;
  window.open(url, '_blank');
}