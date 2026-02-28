'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { Package, ArrowDownToLine, ArrowUpFromLine, SlidersHorizontal } from 'lucide-react';

const actions: Array<{
  title: string;
  description: string;
  icon: typeof Package;
  href: Route;
  color: string;
  bgColor: string;
}> = [
  {
    title: 'Add Product',
    description: 'Create a new product',
    icon: Package,
    href: '/products/new',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'Goods Receipt',
    description: 'Receive inventory',
    icon: ArrowDownToLine,
    href: '/receipts/new',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  {
    title: 'Goods Issue',
    description: 'Issue inventory',
    icon: ArrowUpFromLine,
    href: '/issues/new',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  {
    title: 'Adjust Stock',
    description: 'Stock adjustment',
    icon: SlidersHorizontal,
    href: '/adjustments/new',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
];

export function QuickActions() {
  return (
    <div className="bento-item glass flex h-full flex-col rounded-xl p-5">
      <h3 className="mb-4 text-base font-semibold">Quick Actions</h3>
      <div className="grid flex-1 grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="group flex flex-col items-center justify-center gap-2 rounded-lg border border-border/50 bg-background/50 p-3 text-center transition-all hover:border-primary/30 hover:bg-primary/5"
          >
            <div className={`rounded-lg p-2 ${action.bgColor} ${action.color} transition-transform group-hover:scale-110`}>
              <action.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">{action.title}</p>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
