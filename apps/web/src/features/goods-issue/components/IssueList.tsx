'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { GoodsIssue } from '../types/issue.types';

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
  RETURN_TO_SUPPLIER: 'Return',
  OTHER: 'Other',
};

interface IssueListProps {
  issues: GoodsIssue[];
}

export function IssueList({ issues }: IssueListProps) {
  if (issues.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No issues found</p>
        <Link href="/issues/new">
          <Button className="mt-4">Create First Issue</Button>
        </Link>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Issue #</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Items</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {issues.map((issue) => (
          <TableRow key={issue.id}>
            <TableCell className="font-medium">{issue.issueNumber}</TableCell>
            <TableCell>{issueTypeLabels[issue.issueType] || issue.issueType}</TableCell>
            <TableCell>{issue.items.length} items</TableCell>
            <TableCell className="text-right">B{issue.totalAmount.toFixed(2)}</TableCell>
            <TableCell>
              <Badge variant={statusColors[issue.status]}>{issue.status}</Badge>
            </TableCell>
            <TableCell>{new Date(issue.createdAt).toLocaleDateString()}</TableCell>
            <TableCell>
              <Link href={`/issues/${issue.id}`}>
                <Button variant="ghost" size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
