'use client';

import { ProductForm } from '@/features/product/components/ProductForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/api-client';

export default function NewProductPage() {
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm units={units} categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
