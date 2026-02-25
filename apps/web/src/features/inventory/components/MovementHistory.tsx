'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import type { StockMovement } from '../types/inventory.types';

interface MovementHistoryProps {
  productId: string;
  productName: string;
  sku: string;
  initialMovements: StockMovement[];
  isLoading?: boolean;
  error?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isMoreLoading?: boolean;
}

export function MovementHistory({
  productId,
  productName,
  sku,
  initialMovements,
  isLoading = false,
  error,
  onLoadMore,
  hasMore = false,
  isMoreLoading = false,
}: MovementHistoryProps) {
  const [movements, setMovements] = useState<StockMovement[]>(initialMovements);

  const getMovementTypeLabel = (type: string) => {
    const typeMap = {
      RECEIPT: 'Goods Receipt',
      ISSUE: 'Goods Issue',
      ADJUSTMENT_IN: 'Stock In',
      ADJUSTMENT_OUT: 'Stock Out',
      TRANSFER_IN: 'Transfer In',
      TRANSFER_OUT: 'Transfer Out',
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const getMovementTypeColor = (type: string) => {
    const colorMap = {
      RECEIPT: 'bg-green-100 text-green-800',
      ISSUE: 'bg-red-100 text-red-800',
      ADJUSTMENT_IN: 'bg-blue-100 text-blue-800',
      ADJUSTMENT_OUT: 'bg-orange-100 text-orange-800',
      TRANSFER_IN: 'bg-purple-100 text-purple-800',
      TRANSFER_OUT: 'bg-gray-100 text-gray-800',
    };
    return colorMap[type as keyof typeof colorMap] || 'bg-gray-100 text-gray-800';
  };

  const getStockStatusColor = (quantity: number, minStock: number) => {
    if (quantity === 0) return 'bg-red-100 text-red-800';
    if (quantity <= minStock) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleLoadMore = () => {
    if (onLoadMore && !isMoreLoading) {
      onLoadMore();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Movement History</CardTitle>
              <p className="text-sm text-gray-500 mt-1">{productName} ({sku})</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="mt-2 text-gray-500">Loading movements...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-red-500">Error loading movements: {error}</p>
            </div>
          ) : movements.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">No movements found for this product</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead className="text-right">Unit Cost</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell className="text-sm">
                          {formatDate(movement.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getMovementTypeColor(movement.type)}>
                            {getMovementTypeLabel(movement.type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={
                              movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                            }
                          >
                            {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {movement.balanceAfter}
                        </TableCell>
                        <TableCell className="text-right">
                          ¥{movement.unitCost.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ¥{(movement.quantity * movement.unitCost).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{movement.referenceType}</p>
                            <p className="text-gray-500 text-xs">
                              {movement.referenceId}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {hasMore && (
                <div className="text-center pt-4">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={isMoreLoading}
                  >
                    {isMoreLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Load More
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}