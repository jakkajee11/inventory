'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/api-client';
import { IssueForm } from '@/features/goods-issue/components/IssueForm';
import { useCreateIssue } from '@/features/goods-issue/api/issue.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Product, Unit } from '@/features/product/types/product.types';

interface ProductWithUnit extends Product {
  unit?: Unit;
}

export default function NewIssuePage() {
  const router = useRouter();
  const createMutation = useCreateIssue();

  const { data: products = [] } = useQuery<ProductWithUnit[]>({
    queryKey: ['products', 'active'],
    queryFn: async () => {
      const { data } = await apiClient.get('/products?limit=1000');
      return (data.products || []).map((p: Product) => ({
        ...p,
        currentStock: p.currentStock ?? 0,
        averageCost: p.averageCost ?? 0,
      }));
    },
  });

  const { data: warehouses = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data } = await apiClient.get('/warehouses');
      return data.warehouses || [];
    },
  });

  const handleSubmit = async (formData: Parameters<typeof createMutation.mutateAsync>[0]) => {
    try {
      const issue = await createMutation.mutateAsync(formData);
      router.push(`/issues/${issue.id}`);
    } catch (error) {
      console.error('Failed to create issue:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Goods Issue</CardTitle>
        </CardHeader>
        <CardContent>
          <IssueForm
            products={products}
            warehouses={warehouses}
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
