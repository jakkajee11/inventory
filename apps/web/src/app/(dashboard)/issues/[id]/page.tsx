'use client';

import { use, Suspense, useState } from 'react';
import { useIssue, useSubmitIssue, useApproveIssue, useCancelIssue } from '@/features/goods-issue/api/issue.api';
import { IssueItemList } from '@/features/goods-issue/components/IssueItemList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Link from 'next/link';
import { ArrowLeft, Send, Check, X } from 'lucide-react';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  DRAFT: 'secondary',
  PENDING: 'default',
  APPROVED: 'default',
  CANCELLED: 'destructive',
};

const issueTypeLabels: Record<string, string> = {
  SALE: 'Sale',
  INTERNAL_USE: 'Internal Use',
  DAMAGED: 'Damaged',
  LOST: 'Lost',
  RETURN_TO_SUPPLIER: 'Return to Supplier',
  OTHER: 'Other',
};

function IssueDetailContent({ id }: { id: string }) {
  const { data: issue, isLoading, error } = useIssue(id);
  const submitMutation = useSubmitIssue();
  const approveMutation = useApproveIssue();
  const cancelMutation = useCancelIssue();
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error || !issue) {
    return <div className="text-red-500">Failed to load issue</div>;
  }

  const handleSubmit = () => {
    submitMutation.mutate(issue.id);
  };

  const handleApprove = () => {
    approveMutation.mutate(issue.id);
  };

  const handleCancel = () => {
    if (cancelReason.trim()) {
      cancelMutation.mutate(
        { id: issue.id, reason: cancelReason },
        {
          onSuccess: () => {
            setIsCancelDialogOpen(false);
            setCancelReason('');
          },
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/issues">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{issue.issueNumber}</h1>
            <p className="text-gray-500">{issueTypeLabels[issue.issueType] || issue.issueType}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusColors[issue.status]}>{issue.status}</Badge>
        </div>
      </div>

      {/* Workflow Actions */}
      {issue.status === 'DRAFT' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={submitMutation.isPending}>
                <Send className="h-4 w-4 mr-2" />
                {submitMutation.isPending ? 'Submitting...' : 'Submit for Approval'}
              </Button>
              <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" disabled={cancelMutation.isPending}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel Issue
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel Issue</DialogTitle>
                    <DialogDescription>
                      Please provide a reason for cancelling this issue.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Textarea
                      placeholder="Enter cancellation reason..."
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCancelDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleCancel}
                      disabled={!cancelReason.trim() || cancelMutation.isPending}
                    >
                      {cancelMutation.isPending ? 'Cancelling...' : 'Confirm Cancel'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      {issue.status === 'PENDING' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Button onClick={handleApprove} disabled={approveMutation.isPending}>
                <Check className="h-4 w-4 mr-2" />
                {approveMutation.isPending ? 'Approving...' : 'Approve'}
              </Button>
              <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" disabled={cancelMutation.isPending}>
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reject Issue</DialogTitle>
                    <DialogDescription>
                      Please provide a reason for rejecting this issue.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Textarea
                      placeholder="Enter rejection reason..."
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCancelDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleCancel}
                      disabled={!cancelReason.trim() || cancelMutation.isPending}
                    >
                      {cancelMutation.isPending ? 'Rejecting...' : 'Confirm Reject'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Issue Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Issue Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Issue Number</p>
                <p className="font-medium">{issue.issueNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium">{issueTypeLabels[issue.issueType] || issue.issueType}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Warehouse</p>
                <p className="font-medium">{issue.warehouseName || issue.warehouseId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant={statusColors[issue.status]}>{issue.status}</Badge>
              </div>
            </div>
            {issue.notes && (
              <div>
                <p className="text-sm text-gray-500">Notes</p>
                <p className="font-medium">{issue.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Total Items</p>
              <p className="font-medium">{issue.items.length} items</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="font-medium text-lg">B{issue.totalAmount.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Audit Trail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Created By</p>
                <p className="font-medium">{issue.createdBy}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium">{new Date(issue.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            {issue.approvedBy && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Approved By</p>
                  <p className="font-medium">{issue.approvedBy}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Approved At</p>
                  <p className="font-medium">
                    {issue.approvedAt ? new Date(issue.approvedAt).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Items</CardTitle>
        </CardHeader>
        <CardContent>
          <IssueItemList items={issue.items} />
        </CardContent>
      </Card>
    </div>
  );
}

export default function IssueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  return (
    <div className="p-6">
      <Suspense fallback={<div>Loading...</div>}>
        <IssueDetailContent id={resolvedParams.id} />
      </Suspense>
    </div>
  );
}
