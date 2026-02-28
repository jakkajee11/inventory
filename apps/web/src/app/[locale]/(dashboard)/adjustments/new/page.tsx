'use client';

import { AdjustmentForm } from '@/features/stock-adjustment/components/AdjustmentForm';

export default function NewAdjustmentPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New Stock Adjustment</h1>
      <AdjustmentForm />
    </div>
  );
}
