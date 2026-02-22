import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/api-client';
import type { StockReportResponse, MovementReportResponse } from '../types/report.types';

export const reportKeys = {
  all: ['reports'] as const,
  stock: (filters: Record<string, any>) => [...reportKeys.all, 'stock', filters] as const,
  movements: (filters: Record<string, any>) => [...reportKeys.all, 'movements', filters] as const,
};

export function useStockReport(params: { asOfDate?: string; categoryId?: string; page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: reportKeys.stock(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.asOfDate) searchParams.append('asOfDate', params.asOfDate);
      if (params.categoryId) searchParams.append('categoryId', params.categoryId);
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());

      const { data } = await apiClient.get(`/reports/stock?${searchParams.toString()}`);
      return data as StockReportResponse;
    },
  });
}

export function useMovementReport(params: { startDate?: string; endDate?: string; productId?: string; categoryId?: string; page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: reportKeys.movements(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.startDate) searchParams.append('startDate', params.startDate);
      if (params.endDate) searchParams.append('endDate', params.endDate);
      if (params.productId) searchParams.append('productId', params.productId);
      if (params.categoryId) searchParams.append('categoryId', params.categoryId);
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());

      const { data } = await apiClient.get(`/reports/movements?${searchParams.toString()}`);
      return data as MovementReportResponse;
    },
  });
}

export function getStockReportExportUrl(format: 'PDF' | 'EXCEL' | 'CSV', params: Record<string, any> = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.append(key, value.toString());
  });
  return `${apiClient.defaults.baseURL}/reports/stock/export/${format}?${searchParams.toString()}`;
}

export function getMovementReportExportUrl(format: 'PDF' | 'EXCEL' | 'CSV', params: Record<string, any> = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.append(key, value.toString());
  });
  return `${apiClient.defaults.baseURL}/reports/movements/export/${format}?${searchParams.toString()}`;
}
