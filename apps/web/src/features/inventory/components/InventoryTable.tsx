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
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import type { InventoryItem } from '../types/inventory.types';

interface InventoryTableProps {
  items: InventoryItem[];
}

export function InventoryTable({ items }: InventoryTableProps) {
  const t = useTranslations('inventory');

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock <= 0) {
      return { label: t('status.outOfStock'), variant: 'destructive' as const };
    }
    if (item.currentStock <= item.minStock) {
      return { label: t('status.lowStock'), variant: 'secondary' as const };
    }
    if (item.maxStock && item.currentStock > item.maxStock) {
      return { label: t('status.overstock'), variant: 'default' as const };
    }
    return { label: t('status.normal'), variant: 'default' as const };
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">{t('messages.noInventory')}</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('table.sku')}</TableHead>
          <TableHead>{t('table.product')}</TableHead>
          <TableHead>{t('table.category')}</TableHead>
          <TableHead className="text-right">{t('table.stock')}</TableHead>
          <TableHead className="text-right">{t('table.minStock')}</TableHead>
          <TableHead className="text-right">{t('table.avgCost')}</TableHead>
          <TableHead className="text-right">{t('table.totalValue')}</TableHead>
          <TableHead>{t('table.status')}</TableHead>
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
