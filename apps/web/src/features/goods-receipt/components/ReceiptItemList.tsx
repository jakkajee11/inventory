'use client';

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import type { GoodsReceiptItem } from '../types/receipt.types';

interface ReceiptItemListProps {
  items: GoodsReceiptItem[];
}

export function ReceiptItemList({ items }: ReceiptItemListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>SKU</TableHead>
          <TableHead>Product</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead className="text-right">Unit Cost</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>Notes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.sku}</TableCell>
            <TableCell>{item.productName}</TableCell>
            <TableCell className="text-right">{item.quantity}</TableCell>
            <TableCell className="text-right">THB {item.unitCost.toFixed(2)}</TableCell>
            <TableCell className="text-right font-medium">THB {item.totalCost.toFixed(2)}</TableCell>
            <TableCell>{item.notes || '-'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
