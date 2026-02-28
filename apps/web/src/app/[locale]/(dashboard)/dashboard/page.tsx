'use client';

import { WelcomeHeader } from '@/features/dashboard/components/WelcomeHeader';
import { StatsGrid } from '@/features/dashboard/components/StatsGrid';
import { QuickActions } from '@/features/dashboard/components/QuickActions';
import { LowStockAlerts } from '@/features/dashboard/components/LowStockAlerts';
import { ActivityFeed } from '@/features/dashboard/components/ActivityFeed';
import { InventoryTrendChart } from '@/features/dashboard/components/charts/InventoryTrendChart';
import { MovementSummaryChart } from '@/features/dashboard/components/charts/MovementSummaryChart';
import {
  useDashboardStats,
  useLowStockItems,
  useRecentActivity,
  useInventoryTrends,
  useMovementSummary,
} from '@/features/dashboard/api/dashboard.api';

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: lowStockItems, isLoading: lowStockLoading } = useLowStockItems(5);
  const { data: activityItems, isLoading: activityLoading } = useRecentActivity(10);
  const { data: trendData, isLoading: trendsLoading } = useInventoryTrends(30);
  const { data: movementSummary, isLoading: summaryLoading } = useMovementSummary();

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <WelcomeHeader />

      {/* Stats cards */}
      <StatsGrid stats={stats} isLoading={statsLoading} />

      {/* Bento Grid Layout */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Inventory Trends - spans 2 columns */}
        <div className="md:col-span-2 lg:col-span-2 lg:row-span-2">
          <InventoryTrendChart data={trendData} isLoading={trendsLoading} />
        </div>

        {/* Movement Summary - 1 column */}
        <div className="lg:col-span-1">
          <MovementSummaryChart data={movementSummary} isLoading={summaryLoading} />
        </div>

        {/* Low Stock Alerts - 1 column, spans 2 rows */}
        <div className="lg:col-span-1 lg:row-span-2">
          <LowStockAlerts items={lowStockItems} isLoading={lowStockLoading} />
        </div>

        {/* Quick Actions - 1 column */}
        <div className="lg:col-span-1">
          <QuickActions />
        </div>

        {/* Activity Feed - spans 2 columns */}
        <div className="md:col-span-2 lg:col-span-2 lg:row-span-2">
          <ActivityFeed items={activityItems} isLoading={activityLoading} />
        </div>
      </div>
    </div>
  );
}
