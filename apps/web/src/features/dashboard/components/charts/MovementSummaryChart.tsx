'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import type { MovementSummary } from '../../types/dashboard.types';

interface MovementSummaryChartProps {
  data: MovementSummary | undefined;
  isLoading: boolean;
}

const COLORS = {
  receipts: '#10b981',
  issues: '#3b82f6',
  adjustments: '#f59e0b',
};

export function MovementSummaryChart({ data, isLoading }: MovementSummaryChartProps) {
  if (isLoading) {
    return (
      <div className="bento-item glass flex h-full flex-col rounded-xl p-5">
        <div className="mb-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-1 h-3 w-48" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  const chartData = data
    ? [
        { name: 'Receipts', value: data.receipts, color: COLORS.receipts },
        { name: 'Issues', value: data.issues, color: COLORS.issues },
        { name: 'Adjustments', value: data.adjustments, color: COLORS.adjustments },
      ]
    : [];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bento-item glass flex h-full flex-col rounded-xl p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold">Movement Summary</h3>
        <p className="text-sm text-muted-foreground">Last 30 days breakdown</p>
      </div>
      <div className="min-h-0 flex-1">
        {total > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [value.toLocaleString(), 'Units']}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px' }}
                iconType="circle"
                layout="horizontal"
                verticalAlign="bottom"
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No movement data
          </div>
        )}
      </div>
    </div>
  );
}
