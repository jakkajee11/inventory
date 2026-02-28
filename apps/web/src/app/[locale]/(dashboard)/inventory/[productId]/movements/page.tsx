'use client';

import { StockMovements } from '@/features/inventory/components/StockMovements';

export default async function StockMovementsPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = params ? (await params) : { productId: '' };
  return <StockMovements productId={productId} />;
}
