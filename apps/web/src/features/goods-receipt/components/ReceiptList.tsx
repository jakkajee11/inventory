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
import type { GoodsReceipt } from '../types/receipt.types';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  DRAFT: 'secondary',
  PENDING: 'default',
  APPROVED: 'default',
  CANCELLED: 'destructive',
};

interface ReceiptListProps {
  receipts: GoodsReceipt[];
}

export function ReceiptList({ receipts }: ReceiptListProps) {
  if (receipts.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No receipts found</p>
        <Link href="/receipts/new">
          <Button className="mt-4">Create First Receipt</Button>
        </Link>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Receipt #</TableHead>
          <TableHead>Supplier</TableHead>
          <TableHead>Items</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {receipts.map((receipt) => (
          <TableRow key={receipt.id}>
            <TableCell className="font-medium">{receipt.receiptNumber}</TableCell>
            <TableCell>{receipt.supplierName}</TableCell>
            <TableCell>{receipt.items.length} items</TableCell>
            <TableCell className="text-right">THB {receipt.totalAmount.toFixed(2)}</TableCell>
            <TableCell>
              <Badge variant={statusColors[receipt.status]}>{receipt.status}</Badge>
            </TableCell>
            <TableCell>{new Date(receipt.createdAt).toLocaleDateString()}</TableCell>
            <TableCell>
              <Link href={`/receipts/${receipt.id}`}>
                <Button variant="ghost" size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
