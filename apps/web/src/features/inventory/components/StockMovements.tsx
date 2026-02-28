'use client';

import { MovementHistory } from './MovementHistory';

interface StockMovementsProps {
  productId: string;
}

export function StockMovements({ productId }: StockMovementsProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Stock Movements</h1>
      <MovementHistory productId={productId} />
    </div>
  );
}
