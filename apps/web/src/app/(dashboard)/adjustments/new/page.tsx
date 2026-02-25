'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/api-client';
import { AdjustmentForm } from '@/features/stock-adjustment/components/AdjustmentForm';
import { useCreateAdjustment } from '@/features/stock-adjustment/api/adjustment.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewAdjustmentPage() {
  const router = useRouter();
  const createMutation = useCreateAdjustment();

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await apiClient.get('/products?limit=1000');
      return data.products || [];
    },
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data } = await apiClient.get('/warehouses');
      return data.warehouses || [];
    },
  });

  const handleSubmit = async (formData: any) => {
    try {
      const adjustment = await createMutation.mutateAsync({
        adjustmentType: formData.adjustmentType,
        warehouseId: formData.warehouseId,
        notes: formData.notes,
        items: formData.items.filter((item: any) => item.productId).map((item: any) => ({
          productId: item.productId,
          quantityAfter: item.quantityAfter,
          reason: item.reason,
        })),
      });
      router.push(`/adjustments/${adjustment.id}`);
    } catch (error) {
      console.error('Failed to create adjustment:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Stock Adjustment</CardTitle>
        </CardHeader>
        <CardContent>
          <AdjustmentForm
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
