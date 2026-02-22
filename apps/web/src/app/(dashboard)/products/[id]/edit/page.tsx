'use client';

import { use, Suspense } from 'react';
import { useProduct } from '@/features/product/api/product.api';
import { ProductForm } from '@/features/product/components/ProductForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/api-client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

function EditProductContent({ id }: { id: string }) {
  const { data: product, isLoading: productLoading, error } = useProduct(id);

  const { data: units = [] } = useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      const { data } = await apiClient.get('/units');
      return data.units || [];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await apiClient.get('/categories');
      return data.categories || [];
    },
  });

  if (productLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>;
  }

  if (error || !product) {
    return <div className="text-red-500">Product not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Edit Product</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{product.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm product={product} units={units} categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Suspense fallback={<div>Loading...</div>}>
        <EditProductContent id={resolvedParams.id} />
      </Suspense>
    </div>
  );
}
