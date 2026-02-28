'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface IssueDetailProps {
  id: string;
}

export function IssueDetail({ id }: IssueDetailProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Issue #{id}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Issue Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Issue detail view coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
