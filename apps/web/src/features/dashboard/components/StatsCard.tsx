'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface StatsCardProps {
  title: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  description?: string;
  href?: Route;
  isLoading?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
  trendLabel?: string;
}

export function StatsCard({
  title,
  value,
  change,
  trend,
  icon,
  description,
  href,
  isLoading,
  valuePrefix,
  valueSuffix,
  trendLabel = 'from last period',
}: StatsCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3.5 w-3.5" />;
      case 'down':
        return <TrendingDown className="h-3.5 w-3.5" />;
      default:
        return <Minus className="h-3.5 w-3.5" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'down':
        return 'text-red-500 dark:text-red-400';
      default:
        return 'text-muted-foreground';
    }
  };

  const content = (
    <div className="glass glass-hover group relative overflow-hidden rounded-xl p-5 transition-all duration-300 hover:shadow-lg">
      {/* Background gradient accent */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p className="text-2xl font-bold tracking-tight">
              {valuePrefix}
              {typeof value === 'number' ? value.toLocaleString() : value}
              {valueSuffix}
            </p>
          )}
          {(change !== undefined || description) && !isLoading && (
            <div className="flex items-center gap-1.5 text-xs">
              {change !== undefined && trend && (
                <span className={cn('flex items-center gap-0.5 font-medium', getTrendColor())}>
                  {getTrendIcon()}
                  {change > 0 ? '+' : ''}
                  {change}%
                </span>
              )}
              {trendLabel && (
                <span className="text-muted-foreground">{trendLabel}</span>
              )}
              {description && <span className="text-muted-foreground">{description}</span>}
            </div>
          )}
        </div>
        <div className="rounded-lg bg-primary/10 p-2.5 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          {icon}
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
