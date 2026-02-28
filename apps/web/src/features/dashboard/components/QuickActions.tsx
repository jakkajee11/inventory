'use client';

import { Package, ArrowDownToLine, ArrowUpFromLine, SlidersHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

interface Action {
  titleKey: string;
  descKey: string;
  icon: typeof Package;
  href: string;
  color: string;
  bgColor: string;
}

const actionKeys: Action[] = [
  {
    titleKey: 'addProduct',
    descKey: 'addProductDesc',
    icon: Package,
    href: '/products/new',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    titleKey: 'goodsReceipt',
    descKey: 'goodsReceiptDesc',
    icon: ArrowDownToLine,
    href: '/receipts/new',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  {
    titleKey: 'goodsIssue',
    descKey: 'goodsIssueDesc',
    icon: ArrowUpFromLine,
    href: '/issues/new',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  {
    titleKey: 'adjustStock',
    descKey: 'adjustStockDesc',
    icon: SlidersHorizontal,
    href: '/adjustments/new',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
];

export function QuickActions() {
  const t = useTranslations('dashboard.quickActions');

  return (
    <div className="bento-item glass flex h-full flex-col rounded-xl p-5">
      <h3 className="mb-4 text-base font-semibold">{t('title')}</h3>
      <div className="grid flex-1 grid-cols-2 gap-3">
        {actionKeys.map((action) => (
          <Link
            key={action.titleKey}
            href={action.href}
            className="group flex flex-col items-center justify-center gap-2 rounded-lg border border-border/50 bg-background/50 p-3 text-center transition-all hover:border-primary/30 hover:bg-primary/5"
          >
            <div className={`rounded-lg p-2 ${action.bgColor} ${action.color} transition-transform group-hover:scale-110`}>
              <action.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">{t(action.titleKey)}</p>
              <p className="text-xs text-muted-foreground">{t(action.descKey)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
