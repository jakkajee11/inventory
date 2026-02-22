'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';

interface ProductSearchProps {
  search: string;
  onSearchChange: (search: string) => void;
  includeInactive: boolean;
  onToggleInactive: () => void;
}

export function ProductSearch({
  search,
  onSearchChange,
  includeInactive,
  onToggleInactive,
}: ProductSearchProps) {
  return (
    <div className="flex gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by SKU, name, or barcode..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Button
        variant={includeInactive ? 'default' : 'outline'}
        onClick={onToggleInactive}
      >
        <Filter className="h-4 w-4 mr-2" />
        {includeInactive ? 'Hide Inactive' : 'Show Inactive'}
      </Button>
    </div>
  );
}
