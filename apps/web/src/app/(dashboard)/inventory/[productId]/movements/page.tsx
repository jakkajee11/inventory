'use client';

import { use, Suspense, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useProductMovements } from '@/features/inventory/api/inventory.api';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const movementTypeColors: Record<string, string> = {
  RECEIPT: 'bg-green-100 text-green-800',
  ISSUE: 'bg-red-100 text-red-800',
  ADJUSTMENT_IN: 'bg-blue-100 text-blue-800',
  ADJUSTMENT_OUT: 'bg-orange-100 text-orange-800',
  TRANSFER_IN: 'bg-purple-100 text-purple-800',
  TRANSFER_OUT: 'bg-yellow-100 text-yellow-800',
};

function MovementsContent({ productId }: { productId: string }) {
  const [page] = useState(1);
  const { data, isLoading, error } = useProductMovements(productId, page);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error || !data) {
    return <div className="text-red-500">Failed to load movement history</div>;
  }

  const movements = data.items;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Movement History</h1>
          <p className="text-gray-500">Stock movements for this product</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Movements</CardTitle>
        </CardHeader>
        <CardContent>
          {movements.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No movement history found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Balance After</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>{new Date(movement.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${movementTypeColors[movement.type] || 'bg-gray-100 text-gray-800'}`}>
                        {movement.type.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell>{movement.referenceType}: {movement.referenceId}</TableCell>
                    <TableCell className={`text-right font-medium ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                    </TableCell>
                    <TableCell className="text-right">{movement.balanceAfter}</TableCell>
                    <TableCell className="text-right">THB {movement.unitCost.toFixed(2)}</TableCell>
                    <TableCell className="max-w-xs truncate">{movement.notes || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProductMovementsPage({ params }: { params: Promise<{ productId: string }> }) {
  const resolvedParams = use(params);

  return (
    <div className="p-6">
      <Suspense fallback={<div>Loading...</div>}>
        <MovementsContent productId={resolvedParams.productId} />
      </Suspense>
    </div>
  );
}
