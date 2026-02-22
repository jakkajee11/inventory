'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { InventoryItem } from '../types/inventory.types';

interface InventoryTableProps {
  items: InventoryItem[];
}

export function InventoryTable({ items }: InventoryTableProps) {
  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock <= 0) {
      return { label: 'Out of Stock', variant: 'destructive' as const };
    }
    if (item.currentStock <= item.minStock) {
      return { label: 'Low Stock', variant: 'secondary' as const };
    }
    if (item.maxStock && item.currentStock > item.maxStock) {
      return { label: 'Overstock', variant: 'default' as const };
    }
    return { label: 'Normal', variant: 'default' as const };
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No inventory items found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>SKU</TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Stock</TableHead>
          <TableHead className="text-right">Min Stock</TableHead>
          <TableHead className="text-right">Avg Cost</TableHead>
          <TableHead className="text-right">Total Value</TableHead>
          <TableHead>Status</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const status = getStockStatus(item);
          return (
            <TableRow key={item.productId}>
              <TableCell className="font-medium">{item.sku}</TableCell>
              <TableCell>{item.productName}</TableCell>
              <TableCell>{item.categoryName || '-'}</TableCell>
              <TableCell className="text-right">
                {item.currentStock} {item.unitName}
              </TableCell>
              <TableCell className="text-right">{item.minStock}</TableCell>
              <TableCell className="text-right">THB {item.averageCost.toFixed(2)}</TableCell>
              <TableCell className="text-right">THB {item.totalValue.toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant={status.variant}>{status.label}</Badge>
              </TableCell>
              <TableCell>
                <Link href={`/inventory/${item.productId}/movements`}>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
