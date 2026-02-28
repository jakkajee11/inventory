'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Add Product</h1>
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Product form coming soon...</p>
          <Button className="mt-4">Create Product</Button>
        </CardContent>
      </Card>
    </div>
  );
}
