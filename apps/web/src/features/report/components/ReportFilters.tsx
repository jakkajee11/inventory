'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, RotateCcw } from 'lucide-react';

interface ReportFiltersProps {
  filters: {
    startDate: string;
    endDate: string;
    productId?: string;
    categoryId?: string;
  };
  categories: { id: string; name: string }[];
  products: { id: string; name: string; sku: string }[];
  onFiltersChange: (filters: {
    startDate: string;
    endDate: string;
    productId?: string;
    categoryId?: string;
  }) => void;
  onReset: () => void;
  isFetching?: boolean;
}

export function ReportFilters({
  filters,
  categories,
  products,
  onFiltersChange,
  onReset,
  isFetching = false,
}: ReportFiltersProps) {
  const [tempFilters, setTempFilters] = useState(filters);

  const handleFilterChange = (field: keyof typeof tempFilters, value: any) => {
    const newFilters = { ...tempFilters, [field]: value };
    setTempFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSubmit = () => {
    onFiltersChange(tempFilters);
  };

  const handleReset = () => {
    const defaultFilters = {
      startDate: '',
      endDate: '',
      productId: 'all',
      categoryId: 'all',
    };
    setTempFilters(defaultFilters);
    onReset();
  };

  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-4 bg-gray-50 p-4 rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Report Filters</h3>
        <Button variant="outline" size="sm" onClick={handleReset} disabled={isFetching}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Start Date
          </label>
          <Input
            type="date"
            value={tempFilters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            max={formatDateForInput(today)}
            disabled={isFetching}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            End Date
          </label>
          <Input
            type="date"
            value={tempFilters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            min={tempFilters.startDate || formatDateForInput(lastMonth)}
            max={formatDateForInput(today)}
            disabled={isFetching}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Product</label>
          <Select
            value={tempFilters.productId || 'all'}
            onValueChange={(value) => handleFilterChange('productId', value)}
            disabled={isFetching}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Select
            value={tempFilters.categoryId || 'all'}
            onValueChange={(value) => handleFilterChange('categoryId', value)}
            disabled={isFetching}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={handleSubmit} disabled={isFetching}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
}