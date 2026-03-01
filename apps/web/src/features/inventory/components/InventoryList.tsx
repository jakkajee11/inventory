'use client';

import { InventoryTable } from './InventoryTable';
import { InventoryFilters } from './InventoryFilters';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function InventoryList() {
  const [filters, setFilters] = useState({
    search: '',
    categoryId: 'all',
    stockStatus: 'all' as 'all' | 'low' | 'out' | 'normal',
  });
  const t = useTranslations('inventory');

  // Mock data for demonstration
  const items: any[] = [];
  const categories: { id: string; name: string }[] = [];
  const isLoading = false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-gray-500">{t('manageStock')}</p>
        </div>
      </div>

      <InventoryFilters
        search={filters.search}
        categoryId={filters.categoryId}
        stockStatus={filters.stockStatus}
        categories={categories}
        onSearchChange={(search) => setFilters({ ...filters, search })}
        onCategoryChange={(categoryId) => setFilters({ ...filters, categoryId })}
        onStockStatusChange={(stockStatus) => setFilters({ ...filters, stockStatus })}
        onReset={() => setFilters({ search: '', categoryId: 'all', stockStatus: 'all' })}
        isFetching={isLoading}
      />

      <InventoryTable items={items} />
    </div>
  );
}
