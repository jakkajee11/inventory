'use client';

import { IssueForm } from '@/features/goods-issue/components/IssueForm';

export default function NewIssuePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New Goods Issue</h1>
      <IssueForm />
    </div>
  );
}
