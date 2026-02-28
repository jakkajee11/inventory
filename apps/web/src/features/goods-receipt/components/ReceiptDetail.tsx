'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ReceiptDetailProps {
  id: string;
}

export function ReceiptDetail({ id }: ReceiptDetailProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Receipt #{id}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Receipt Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Receipt detail view coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
