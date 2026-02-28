'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>
      <Card>
        <CardHeader>
          <CardTitle>Inventory Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Report generation coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
