'use client';

import { IssueDetail } from '@/features/goods-issue/components/IssueDetail';

export default async function IssueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = params ? (await params) : { id: '' };
  return <IssueDetail id={id} />;
}
