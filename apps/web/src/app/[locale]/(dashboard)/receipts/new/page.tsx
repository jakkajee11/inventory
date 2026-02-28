'use client';

import { ReceiptForm } from '@/features/goods-receipt/components/ReceiptForm';

export default function NewReceiptPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New Goods Receipt</h1>
      <ReceiptForm />
    </div>
  );
}
