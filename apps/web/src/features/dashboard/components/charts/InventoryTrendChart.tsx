'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';
import type { TrendDataPoint } from '../../types/dashboard.types';

interface InventoryTrendChartProps {
  data: TrendDataPoint[] | undefined;
  isLoading: boolean;
}

export function InventoryTrendChart({ data, isLoading }: InventoryTrendChartProps) {
  const t = useTranslations('dashboard.charts');

  if (isLoading) {
    return (
      <div className="bento-item glass flex h-full flex-col rounded-xl p-5">
        <div className="mb-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-1 h-3 w-60" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="bento-item glass flex h-full flex-col rounded-xl p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold">{t('inventoryTrends')}</h3>
        <p className="text-sm text-muted-foreground">{t('last30Days')}</p>
      </div>
      <div className="min-h-0 flex-1">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorReceipts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorIssues" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString()}
                className="text-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px' }}
                iconType="circle"
              />
              <Area
                type="monotone"
                dataKey="receipts"
                name={t('receipts')}
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorReceipts)"
              />
              <Area
                type="monotone"
                dataKey="issues"
                name={t('issues')}
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorIssues)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {t('noTrendData')}
          </div>
        )}
      </div>
    </div>
  );
}
