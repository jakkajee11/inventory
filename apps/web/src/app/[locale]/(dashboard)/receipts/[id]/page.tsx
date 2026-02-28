'use client';

import { ReceiptDetail } from '@/features/goods-receipt/components/ReceiptDetail';

export default async function ReceiptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = params ? (await params) : { id: '' };
  return <ReceiptDetail id={id} />;
}
