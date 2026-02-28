'use client';

import { Package, AlertTriangle, AlertCircle, Activity } from 'lucide-react';
import { StatsCard } from './StatsCard';
import type { DashboardStats } from '../types/dashboard.types';
import { useTranslations } from 'next-intl';

interface StatsGridProps {
  stats: DashboardStats | undefined;
  isLoading: boolean;
}

export function StatsGrid({ stats, isLoading }: StatsGridProps) {
  const t = useTranslations('dashboard.stats');

  const statsData: Array<{
    title: string;
    value: number;
    icon: React.ReactNode;
    href: string;
    change?: number;
    trend?: 'up' | 'down';
    description?: string;
    valuePrefix?: string;
  }> = [
    {
      title: t('totalProducts'),
      value: stats?.totalProducts ?? 0,
      icon: <Package className="h-5 w-5" />,
      href: '/products',
      change: 12,
      trend: 'up' as const,
    },
    {
      title: t('lowStockItems'),
      value: stats?.lowStockCount ?? 0,
      icon: <AlertTriangle className="h-5 w-5" />,
      href: '/inventory',
      change: -5,
      trend: 'down' as const,
    },
    {
      title: t('outOfStock'),
      value: stats?.outOfStockCount ?? 0,
      icon: <AlertCircle className="h-5 w-5" />,
      href: '/inventory',
      description: t('needsAttention'),
    },
    {
      title: t('inventoryValue'),
      value: stats?.totalValue ?? 0,
      icon: <Activity className="h-5 w-5" />,
      href: '/reports',
      valuePrefix: '$',
      change: 8,
      trend: 'up' as const,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat) => (
        <StatsCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          href={stat.href}
          isLoading={isLoading}
          change={stat.change}
          trend={stat.trend}
          description={stat.description}
          valuePrefix={stat.valuePrefix}
        />
      ))}
    </div>
  );
}
