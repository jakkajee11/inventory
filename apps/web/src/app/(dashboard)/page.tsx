'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Package,
  AlertTriangle,
  Clock,
  Activity,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

// Mock data - replace with real API calls later
const summaryData = {
  totalProducts: {
    value: 1234,
    change: 12,
    trend: 'up' as const,
  },
  lowStockItems: {
    value: 23,
    change: -5,
    trend: 'down' as const,
  },
  pendingApprovals: {
    value: 8,
    change: 0,
    trend: 'neutral' as const,
  },
  todaysTransactions: {
    value: 156,
    change: 23,
    trend: 'up' as const,
  },
};

const recentActivity = [
  {
    id: '1',
    type: 'receipt',
    message: 'Received 50 units of Widget A',
    timestamp: '2 minutes ago',
    user: 'John Doe',
  },
  {
    id: '2',
    type: 'issue',
    message: 'Issued 10 units of Widget B to Production',
    timestamp: '15 minutes ago',
    user: 'Jane Smith',
  },
  {
    id: '3',
    type: 'adjustment',
    message: 'Stock adjustment for Widget C (-5 units)',
    timestamp: '1 hour ago',
    user: 'Mike Johnson',
  },
  {
    id: '4',
    type: 'product',
    message: 'New product "Widget D" added',
    timestamp: '2 hours ago',
    user: 'Sarah Wilson',
  },
  {
    id: '5',
    type: 'receipt',
    message: 'Received 100 units of Widget E',
    timestamp: '3 hours ago',
    user: 'John Doe',
  },
];

interface SummaryCardProps {
  title: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  href?: string;
}

function SummaryCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  description,
  href,
}: SummaryCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const content = (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        {(change !== undefined || description) && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            {change !== undefined && trend && (
              <>
                {getTrendIcon()}
                <span className={getTrendColor()}>
                  {change > 0 ? '+' : ''}
                  {change}%
                </span>
                <span>from last month</span>
              </>
            )}
            {description && <span>{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'receipt':
      return <Package className="h-4 w-4 text-green-500" />;
    case 'issue':
      return <Package className="h-4 w-4 text-blue-500" />;
    case 'adjustment':
      return <Package className="h-4 w-4 text-yellow-500" />;
    case 'product':
      return <Package className="h-4 w-4 text-purple-500" />;
    default:
      return <Activity className="h-4 w-4 text-muted-foreground" />;
  }
}

export default function DashboardPage() {
  const { user } = useAuthStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {getGreeting()}, {user?.name || 'User'}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your inventory today.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Products"
          value={summaryData.totalProducts.value}
          change={summaryData.totalProducts.change}
          trend={summaryData.totalProducts.trend}
          icon={Package}
          href="/products"
        />
        <SummaryCard
          title="Low Stock Items"
          value={summaryData.lowStockItems.value}
          change={summaryData.lowStockItems.change}
          trend={summaryData.lowStockItems.trend}
          icon={AlertWarning}
          href="/inventory"
        />
        <SummaryCard
          title="Pending Approvals"
          value={summaryData.pendingApprovals.value}
          change={summaryData.pendingApprovals.change}
          trend={summaryData.pendingApprovals.trend}
          icon={Clock}
          href="/adjustments"
        />
        <SummaryCard
          title="Today's Transactions"
          value={summaryData.todaysTransactions.value}
          change={summaryData.todaysTransactions.change}
          trend={summaryData.todaysTransactions.trend}
          icon={Activity}
          href="/reports"
        />
      </div>

      {/* Recent activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest inventory movements and changes
              </CardDescription>
            </div>
            <Link
              href="/reports"
              className="flex items-center text-sm text-primary hover:underline"
            >
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.message}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{activity.user}</span>
                      <span>•</span>
                      <span>{activity.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks you might want to perform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/products/new"
              className="flex items-center gap-2 rounded-lg border p-3 hover:bg-accent transition-colors"
            >
              <Package className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Add New Product</span>
            </Link>
            <Link
              href="/receipts/new"
              className="flex items-center gap-2 rounded-lg border p-3 hover:bg-accent transition-colors"
            >
              <Package className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Create Receipt</span>
            </Link>
            <Link
              href="/issues/new"
              className="flex items-center gap-2 rounded-lg border p-3 hover:bg-accent transition-colors"
            >
              <Package className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">Create Issue</span>
            </Link>
            <Link
              href="/adjustments/new"
              className="flex items-center gap-2 rounded-lg border p-3 hover:bg-accent transition-colors"
            >
              <Package className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium">Stock Adjustment</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Fix: Use the correct icon for AlertWarning
function AlertWarning({ className }: { className?: string }) {
  return <AlertTriangle className={className} />;
}
