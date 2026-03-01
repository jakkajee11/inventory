'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  Layers,
  Warehouse,
  FileText,
  FileMinus,
  Sliders,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Boxes,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

interface NavItem {
  titleKey: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    titleKey: 'dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    titleKey: 'products',
    href: '/products',
    icon: Package,
  },
  {
    titleKey: 'categories',
    href: '/categories',
    icon: Layers,
  },
  {
    titleKey: 'inventory',
    href: '/inventory',
    icon: Warehouse,
  },
  {
    titleKey: 'receipts',
    href: '/receipts',
    icon: FileText,
  },
  {
    titleKey: 'issues',
    href: '/issues',
    icon: FileMinus,
  },
  {
    titleKey: 'adjustments',
    href: '/adjustments',
    icon: Sliders,
  },
  {
    titleKey: 'reports',
    href: '/reports',
    icon: BarChart3,
  },
  {
    titleKey: 'notifications',
    href: '/notifications',
    icon: Bell,
  },
  {
    titleKey: 'settings',
    href: '/settings',
    icon: Settings,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const t = useTranslations('navigation.sidebar');

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full bg-card border-r border-border transition-all duration-300 lg:static lg:z-0',
          isCollapsed ? 'w-16' : 'w-64',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo/Brand */}
          <div
            className={cn(
              'flex h-16 items-center border-b border-border px-4',
              isCollapsed ? 'justify-center' : 'justify-between'
            )}
          >
            {!isCollapsed && (
              <Link href="/dashboard" className="flex items-center gap-2">
                <Boxes className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">Inventory</span>
              </Link>
            )}
            {isCollapsed && (
              <Link href="/dashboard" className="flex items-center justify-center">
                <Boxes className="h-6 w-6 text-primary" />
              </Link>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                const title = t(item.titleKey);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                        isCollapsed && 'justify-center px-2'
                      )}
                      title={isCollapsed ? title : undefined}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span>{title}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Collapse Toggle - Desktop only */}
          <div className="hidden border-t border-border p-2 lg:block">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  <span>{t('collapse')}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
