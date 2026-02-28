'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Product #{id}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Product edit form coming soon...</p>
          <Button className="mt-4">Update Product</Button>
        </CardContent>
      </Card>
    </div>
  );
}
