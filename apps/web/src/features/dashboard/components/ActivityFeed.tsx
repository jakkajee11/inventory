'use client';

import { formatDistanceToNow } from 'date-fns';
import { ArrowDownToLine, ArrowUpFromLine, SlidersHorizontal, Package, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import type { ActivityItem } from '../types/dashboard.types';

interface ActivityFeedProps {
  items: ActivityItem[] | undefined;
  isLoading: boolean;
}

export function ActivityFeed({ items, isLoading }: ActivityFeedProps) {
  const t = useTranslations('dashboard.activityFeed');

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'receipt':
        return <ArrowDownToLine className="h-4 w-4 text-emerald-500" />;
      case 'issue':
        return <ArrowUpFromLine className="h-4 w-4 text-blue-500" />;
      case 'adjustment':
        return <SlidersHorizontal className="h-4 w-4 text-amber-500" />;
      default:
        return <Package className="h-4 w-4 text-purple-500" />;
    }
  };

  const getActivityBg = (type: string) => {
    switch (type) {
      case 'receipt':
        return 'bg-emerald-500/10';
      case 'issue':
        return 'bg-blue-500/10';
      case 'adjustment':
        return 'bg-amber-500/10';
      default:
        return 'bg-purple-500/10';
    }
  };

  return (
    <div className="bento-item glass flex h-full flex-col rounded-xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold">{t('title')}</h3>
        <Link
          href="/reports"
          className="flex items-center text-xs text-primary hover:underline"
        >
          {t('viewAll')}
          <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </div>

      <div className="flex-1 space-y-3 overflow-auto custom-scrollbar">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))
        ) : items && items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-lg border border-border/30 bg-background/30 p-3 transition-colors hover:bg-background/50"
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${getActivityBg(item.type)}`}>
                {getActivityIcon(item.type)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-tight">{item.message}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  {item.referenceNumber && (
                    <>
                      <span className="rounded bg-muted px-1 font-mono text-[10px]">
                        {item.referenceNumber}
                      </span>
                      <span>•</span>
                    </>
                  )}
                  <span>
                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {t('noActivity')}
          </div>
        )}
      </div>
    </div>
  );
}
