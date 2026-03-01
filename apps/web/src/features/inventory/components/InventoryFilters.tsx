'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface InventoryFiltersProps {
  search: string;
  categoryId: string;
  stockStatus: 'all' | 'low' | 'out' | 'normal';
  categories: { id: string; name: string }[];
  onSearchChange: (search: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onStockStatusChange: (stockStatus: 'all' | 'low' | 'out' | 'normal') => void;
  onReset: () => void;
  isFetching?: boolean;
}

export function InventoryFilters({
  search,
  categoryId,
  stockStatus,
  categories,
  onSearchChange,
  onCategoryChange,
  onStockStatusChange,
  onReset,
  isFetching = false,
}: InventoryFiltersProps) {
  const t = useTranslations('inventory.filters');

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder={t('search')}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
            disabled={isFetching}
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={stockStatus}
            onValueChange={(value) => onStockStatusChange(value as any)}
            disabled={isFetching}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder={t('status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatus')}</SelectItem>
              <SelectItem value="low">{t('lowStock')}</SelectItem>
              <SelectItem value="out">{t('outOfStock')}</SelectItem>
              <SelectItem value="normal">{t('normal')}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={categoryId}
            onValueChange={onCategoryChange}
            disabled={isFetching}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t('category')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allCategories')}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={onReset} disabled={isFetching}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
