'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReceiptList } from '@/features/goods-receipt/components/ReceiptList';
import { useReceipts } from '@/features/goods-receipt/api/receipt.api';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function ReceiptsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = useReceipts(page);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Goods Receipts</h1>
          <p className="text-gray-500">Record incoming goods from suppliers</p>
        </div>
        <Link href="/receipts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Receipt
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receipt List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          ) : (
            <ReceiptList receipts={data?.receipts ?? []} />
          )}
        </CardContent>
      </Card>

      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => p - 1)}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-500">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => p + 1)}
            disabled={page >= data.pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
