'use client';

import { InventoryTable } from './InventoryTable';
import { InventoryFilters } from './InventoryFilters';
import { useState } from 'react';

export function InventoryList() {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    location: '',
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-gray-500">Manage your stock levels</p>
        </div>
      </div>

      <InventoryFilters
        filters={filters}
        onFiltersChange={setFilters}
      />

      <InventoryTable filters={filters} />
    </div>
  );
}
