'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Product #{id}</h1>
        <Link href={`/products/${id}/edit`}>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Product detail view coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
