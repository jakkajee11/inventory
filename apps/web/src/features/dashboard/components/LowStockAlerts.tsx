'use client';

import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import type { LowStockItem } from '../types/dashboard.types';

interface LowStockAlertsProps {
  items: LowStockItem[] | undefined;
  isLoading: boolean;
}

export function LowStockAlerts({ items, isLoading }: LowStockAlertsProps) {
  const t = useTranslations('dashboard.lowStockAlerts');

  const getStockPercentage = (current: number, min: number) => {
    if (min === 0) return 0;
    return Math.min(100, Math.round((current / min) * 100));
  };

  return (
    <div className="bento-item glass flex h-full flex-col rounded-xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h3 className="text-base font-semibold">{t('title')}</h3>
        </div>
        <Link
          href="/inventory?stockStatus=low"
          className="flex items-center text-xs text-primary hover:underline"
        >
          {t('viewAll')}
          <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </div>

      <div className="flex-1 space-y-3 overflow-auto custom-scrollbar">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))
        ) : items && items.length > 0 ? (
          items.map((item) => {
            const percentage = getStockPercentage(item.currentStock, item.minStock);
            return (
              <Link
                key={item.productId}
                href={{ pathname: '/inventory', query: { product: item.productId } }}
                className="block rounded-lg border border-border/50 bg-background/30 p-3 transition-colors hover:bg-background/50"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">{item.sku}</p>
                  </div>
                  <span className="ml-2 shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                    {item.currentStock} {t('left')}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-500 to-amber-500 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('min')}: {item.minStock} | {t('current')}: {item.currentStock}
                </p>
              </Link>
            );
          })
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {t('noAlerts')}
          </div>
        )}
      </div>
    </div>
  );
}
