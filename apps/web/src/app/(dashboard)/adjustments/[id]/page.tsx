'use client';

import { use, Suspense, useState } from 'react';
import { useAdjustment, useSubmitAdjustment, useApproveAdjustment, useCancelAdjustment } from '@/features/stock-adjustment/api/adjustment.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { ArrowLeft, Send, Check, X } from 'lucide-react';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  DRAFT: 'secondary',
  PENDING: 'default',
  APPROVED: 'default',
  CANCELLED: 'destructive',
};

const typeLabels: Record<string, string> = {
  INVENTORY_COUNT: 'Inventory Count',
  DAMAGE: 'Damage',
  THEFT: 'Theft',
  EXPIRATION: 'Expiration',
  OTHER: 'Other',
};

function AdjustmentDetailContent({ id }: { id: string }) {
  const [cancelReason, setCancelReason] = useState('');
  const { data: adjustment, isLoading, error } = useAdjustment(id);
  const submitMutation = useSubmitAdjustment();
  const approveMutation = useApproveAdjustment();
  const cancelMutation = useCancelAdjustment();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error || !adjustment) {
    return <div className="text-red-500">Failed to load adjustment</div>;
  }

  const handleSubmit = () => {
    submitMutation.mutate(id);
  };

  const handleApprove = () => {
    approveMutation.mutate(id);
  };

  const handleCancel = () => {
    if (cancelReason.trim()) {
      cancelMutation.mutate({ id, reason: cancelReason });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/adjustments">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{adjustment.adjustmentNumber}</h1>
            <p className="text-gray-500">{typeLabels[adjustment.adjustmentType] || adjustment.adjustmentType}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusColors[adjustment.status]}>{adjustment.status}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Adjustment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Adjustment Number</p>
                <p className="font-medium">{adjustment.adjustmentNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium">{typeLabels[adjustment.adjustmentType] || adjustment.adjustmentType}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Warehouse</p>
              <p className="font-medium">{adjustment.warehouseId}</p>
            </div>
            {adjustment.notes && (
              <div>
                <p className="text-sm text-gray-500">Notes</p>
                <p className="font-medium">{adjustment.notes}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">{new Date(adjustment.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant={statusColors[adjustment.status]}>{adjustment.status}</Badge>
              </div>
            </div>
            {adjustment.approvedBy && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Approved By</p>
                  <p className="font-medium">{adjustment.approvedBy}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Approved At</p>
                  <p className="font-medium">{adjustment.approvedAt ? new Date(adjustment.approvedAt).toLocaleDateString() : '-'}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {adjustment.status === 'DRAFT' && (
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
              >
                <Send className="h-4 w-4 mr-2" />
                Submit for Approval
              </Button>
            )}
            {adjustment.status === 'PENDING' && (
              <>
                <Button
                  className="w-full"
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Reason for cancellation..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                  <Button
                    className="w-full"
                    variant="destructive"
                    onClick={handleCancel}
                    disabled={cancelMutation.isPending || !cancelReason.trim()}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </>
            )}
            {adjustment.status === 'APPROVED' && (
              <p className="text-sm text-gray-500">This adjustment has been approved and stock has been updated.</p>
            )}
            {adjustment.status === 'CANCELLED' && (
              <p className="text-sm text-gray-500">This adjustment has been cancelled.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Items ({adjustment.items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Before</TableHead>
                <TableHead className="text-right">After</TableHead>
                <TableHead className="text-right">Difference</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adjustment.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.productName}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell className="text-right">{item.quantityBefore}</TableCell>
                  <TableCell className="text-right">{item.quantityAfter}</TableCell>
                  <TableCell className={`text-right font-medium ${item.difference < 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {item.difference > 0 ? '+' : ''}{item.difference}
                  </TableCell>
                  <TableCell>{item.reason || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdjustmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  return (
    <div className="p-6">
      <Suspense fallback={<div>Loading...</div>}>
        <AdjustmentDetailContent id={resolvedParams.id} />
      </Suspense>
    </div>
  );
}
