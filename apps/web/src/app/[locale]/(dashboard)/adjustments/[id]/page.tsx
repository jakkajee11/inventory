'use client';

import { AdjustmentDetail } from '@/features/stock-adjustment/components/AdjustmentDetail';

export default async function AdjustmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = params ? (await params) : { id: '' };
  return <AdjustmentDetail id={id} />;
}
