'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReceiptForm } from '@/features/goods-receipt/components/ReceiptForm';
import { useCreateReceipt } from '@/features/goods-receipt/api/receipt.api';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/api-client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { CreateReceiptFormData } from '@/features/goods-receipt/schemas/receipt.schema';

// Define Warehouse type locally
interface Warehouse {
  id: string;
  name: string;
  code?: string;
}

export default function NewReceiptPage() {
  const router = useRouter();
  const createMutation = useCreateReceipt();

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

  const handleSubmit = async (formData: CreateReceiptFormData) => {
    try {
      const receipt = await createMutation.mutateAsync(formData);
      console.log('Receipt created successfully');
      router.push(`/receipts/${receipt.id}`);
    } catch (error) {
      console.error('Failed to create receipt:', error);
      alert('Failed to create receipt. Please try again.');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/receipts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">New Goods Receipt</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Receipt</CardTitle>
        </CardHeader>
        <CardContent>
          <ReceiptForm
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
