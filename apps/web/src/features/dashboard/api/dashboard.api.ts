import { useQuery } from '@tanstack/react-query';
import { subDays, format } from 'date-fns';
import apiClient from '@/lib/api/api-client';
import type { StockReportResponse, MovementReportResponse } from '@/features/report/types/report.types';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  lowStock: (limit: number) => [...dashboardKeys.all, 'lowStock', limit] as const,
  activity: (limit: number) => [...dashboardKeys.all, 'activity', limit] as const,
  trends: (startDate: string, endDate: string) => [...dashboardKeys.all, 'trends', startDate, endDate] as const,
  movementSummary: () => [...dashboardKeys.all, 'movement-summary'] as const,
};

// Fetch dashboard stats from stock report
export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: async () => {
      const { data } = await apiClient.get('/reports/stock?limit=1');
      const report = data as StockReportResponse;
      return {
        totalProducts: report.summary.totalProducts,
        lowStockCount: report.summary.lowStockCount,
        outOfStockCount: report.summary.outOfStockCount,
        totalValue: report.summary.totalValue,
      };
    },
  });
}

// Fetch low stock items from inventory
export function useLowStockItems(limit = 5) {
  return useQuery({
    queryKey: dashboardKeys.lowStock(limit),
    queryFn: async () => {
      const { data } = await apiClient.get(`/inventory?stockStatus=low&limit=${limit}`);
      return (data.items || []).map((item: Record<string, unknown>) => ({
        productId: item.productId,
        sku: item.sku,
        productName: item.productName,
        currentStock: item.currentStock,
        minStock: item.minStock,
        categoryName: item.categoryName,
      }));
    },
  });
}

// Fetch recent activity from movement report
export function useRecentActivity(limit = 10) {
  return useQuery({
    queryKey: dashboardKeys.activity(limit),
    queryFn: async () => {
      const endDate = format(new Date(), 'yyyy-MM-dd');
      const startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');
      const { data } = await apiClient.get(
        `/reports/movements?startDate=${startDate}&endDate=${endDate}&limit=${limit}`
      );
      const response = data as MovementReportResponse;

      return (response.items || []).map((item) => {
        let type: 'receipt' | 'issue' | 'adjustment' = 'adjustment';
        if (item.movementType === 'IN' || item.referenceType === 'Receipt') type = 'receipt';
        else if (item.movementType === 'OUT' || item.referenceType === 'Issue') type = 'issue';

        return {
          id: item.id,
          type,
          message: `${type === 'receipt' ? 'Received' : type === 'issue' ? 'Issued' : 'Adjusted'} ${Math.abs(item.quantity)} units of ${item.productName}`,
          timestamp: item.movementDate,
          productName: item.productName,
          quantity: item.quantity,
          referenceNumber: item.referenceNumber,
        };
      });
    },
  });
}

// Fetch inventory trends from movement report
export function useInventoryTrends(days = 30) {
  return useQuery({
    queryKey: dashboardKeys.trends(
      format(subDays(new Date(), days), 'yyyy-MM-dd'),
      format(new Date(), 'yyyy-MM-dd')
    ),
    queryFn: async () => {
      const endDate = format(new Date(), 'yyyy-MM-dd');
      const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
      const { data } = await apiClient.get(
        `/reports/movements?startDate=${startDate}&endDate=${endDate}&limit=1000`
      );
      const response = data as MovementReportResponse;

      // Group by date
      const dateMap = new Map<string, { receipts: number; issues: number }>();

      // Initialize all dates in range
      for (let i = 0; i <= days; i++) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        dateMap.set(date, { receipts: 0, issues: 0 });
      }

      // Aggregate movements by date
      (response.items || []).forEach((item) => {
        const date = item.movementDate?.split('T')[0];
        if (!date) return;
        const existing = dateMap.get(date) || { receipts: 0, issues: 0 };
        if (item.movementType === 'IN' || item.referenceType === 'Receipt') {
          existing.receipts += Math.abs(item.quantity);
        } else if (item.movementType === 'OUT' || item.referenceType === 'Issue') {
          existing.issues += Math.abs(item.quantity);
        }
        dateMap.set(date, existing);
      });

      // Convert to array sorted by date
      return Array.from(dateMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, values]) => ({
          date: format(new Date(date), 'MMM dd'),
          receipts: values.receipts,
          issues: values.issues,
          net: values.receipts - values.issues,
        }));
    },
  });
}

// Fetch movement summary for donut chart
export function useMovementSummary() {
  return useQuery({
    queryKey: dashboardKeys.movementSummary(),
    queryFn: async () => {
      const endDate = format(new Date(), 'yyyy-MM-dd');
      const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      const { data } = await apiClient.get(
        `/reports/movements?startDate=${startDate}&endDate=${endDate}&limit=1000`
      );
      const response = data as MovementReportResponse;

      let receipts = 0;
      let issues = 0;
      let adjustments = 0;

      (response.items || []).forEach((item) => {
        const qty = Math.abs(item.quantity);
        if (item.referenceType === 'Receipt') {
          receipts += qty;
        } else if (item.referenceType === 'Issue') {
          issues += qty;
        } else {
          adjustments += qty;
        }
      });

      return { receipts, issues, adjustments };
    },
  });
}
