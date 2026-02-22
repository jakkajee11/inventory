'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { StockAdjustment } from '../types/adjustment.types';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  DRAFT: 'secondary',
  PENDING: 'default',
  APPROVED: 'default',
  CANCELLED: 'destructive',
};

const typeLabels: Record<string, string> = {
  INVENTORY_COUNT: 'Inventory Count',
  DAMAGE: 'Damage',
  THEFT: 'Theft',
  EXPIRATION: 'Expiration',
  OTHER: 'Other',
};

interface AdjustmentListProps {
  adjustments: StockAdjustment[];
}

export function AdjustmentList({ adjustments }: AdjustmentListProps) {
  if (adjustments.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No adjustments found</p>
        <Link href="/adjustments/new"><Button className="mt-4">Create First Adjustment</Button></Link>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Number</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {adjustments.map((adj) => (
          <TableRow key={adj.id}>
            <TableCell className="font-medium">{adj.adjustmentNumber}</TableCell>
            <TableCell>{typeLabels[adj.adjustmentType] || adj.adjustmentType}</TableCell>
            <TableCell>{adj.items.length} items</TableCell>
            <TableCell><Badge variant={statusColors[adj.status]}>{adj.status}</Badge></TableCell>
            <TableCell>{new Date(adj.createdAt).toLocaleDateString()}</TableCell>
            <TableCell>
              <Link href={`/adjustments/${adj.id}`}>
                <Button variant="ghost" size="sm"><ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
