'use client';

import { useState } from 'react';
import { useAdjustments } from '@/features/stock-adjustment/api/adjustment.api';
import { AdjustmentList } from '@/features/stock-adjustment/components/AdjustmentList';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function AdjustmentsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string | undefined>();
  const { data, isLoading, refetch } = useAdjustments(page, status);

  const adjustments = data?.adjustments || [];
  const pagination = data?.pagination;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Stock Adjustments</h1>
          <p className="text-gray-500">{pagination?.total || 0} adjustments total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Link href="/adjustments/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Adjustment
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={status === undefined ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatus(undefined)}
        >
          All
        </Button>
        <Button
          variant={status === 'DRAFT' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatus('DRAFT')}
        >
          Draft
        </Button>
        <Button
          variant={status === 'PENDING' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatus('PENDING')}
        >
          Pending
        </Button>
        <Button
          variant={status === 'APPROVED' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatus('APPROVED')}
        >
          Approved
        </Button>
        <Button
          variant={status === 'CANCELLED' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatus('CANCELLED')}
        >
          Cancelled
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <AdjustmentList adjustments={adjustments} />
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="py-2 px-4">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
