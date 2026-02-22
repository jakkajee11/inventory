'use client';

import { use, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ReceiptItemList } from '@/features/goods-receipt/components/ReceiptItemList';
import { useReceipt, useSubmitReceipt, useApproveReceipt, useCancelReceipt } from '@/features/goods-receipt/api/receipt.api';
import { ArrowLeft, Send, Check, X } from 'lucide-react';
import Link from 'next/link';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  DRAFT: 'secondary',
  PENDING: 'default',
  APPROVED: 'default',
  CANCELLED: 'destructive',
};

function ReceiptDetailContent({ id }: { id: string }) {
  const { data: receipt, isLoading, error } = useReceipt(id);
  const submitMutation = useSubmitReceipt();
  const approveMutation = useApproveReceipt();
  const cancelMutation = useCancelReceipt();

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>;
  }

  if (error || !receipt) {
    return <div className="text-red-500">Failed to load receipt</div>;
  }

  const handleSubmit = async () => {
    try {
      await submitMutation.mutateAsync(id);
      console.log('Receipt submitted for approval');
    } catch (error) {
      console.error('Failed to submit receipt:', error);
      alert('Failed to submit receipt. Please try again.');
    }
  };

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(id);
      console.log('Receipt approved');
    } catch (error) {
      console.error('Failed to approve receipt:', error);
      alert('Failed to approve receipt. Please try again.');
    }
  };

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync({ id, reason: 'Cancelled by user' });
      console.log('Receipt cancelled');
    } catch (error) {
      console.error('Failed to cancel receipt:', error);
      alert('Failed to cancel receipt. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/receipts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{receipt.receiptNumber}</h1>
            <p className="text-gray-500">{receipt.supplierName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusColors[receipt.status]}>{receipt.status}</Badge>
          
          {receipt.status === 'DRAFT' && (
            <Button onClick={handleSubmit} disabled={submitMutation.isPending}>
              <Send className="h-4 w-4 mr-2" />
              Submit
            </Button>
          )}
          
          {receipt.status === 'PENDING' && (
            <>
              <Button onClick={handleApprove} disabled={approveMutation.isPending}>
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button variant="destructive" onClick={handleCancel} disabled={cancelMutation.isPending}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">THB {receipt.totalAmount.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{receipt.items.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{new Date(receipt.createdAt).toLocaleDateString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <ReceiptItemList items={receipt.items} />
        </CardContent>
      </Card>

      {receipt.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{receipt.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function ReceiptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  return (
    <div className="p-6">
      <Suspense fallback={<div>Loading...</div>}>
        <ReceiptDetailContent id={resolvedParams.id} />
      </Suspense>
    </div>
  );
}
