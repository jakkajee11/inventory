'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AdjustmentDetailProps {
  id: string;
}

export function AdjustmentDetail({ id }: AdjustmentDetailProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Adjustment #{id}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Adjustment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Adjustment detail view coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
