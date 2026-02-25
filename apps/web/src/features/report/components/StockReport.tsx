'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { getStockReportExportUrl } from '../../api/report.api';
import type { StockReportResponse } from '../../types/report.types';

interface StockReportProps {
  reportData: StockReportResponse | undefined;
  isLoading: boolean;
  error: string | null;
  onRefresh?: () => void;
}

export function StockReport({ reportData, isLoading, error, onRefresh }: StockReportProps) {
  const handleExport = (format: 'PDF' | 'EXCEL' | 'CSV') => {
    const params = {
      asOfDate: reportData?.asOfDate,
      categoryId: undefined, // Could be passed if filters are available
    };
    const url = getStockReportExportUrl(format, params);
    window.open(url, '_blank');
  };

  const getStockStatusColor = (status: 'LOW' | 'NORMAL' | 'HIGH') => {
    switch (status) {
      case 'LOW':
        return 'bg-yellow-100 text-yellow-800';
      case 'OUT':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="py-8 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-2 text-gray-500">Generating report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-red-500">Error: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No report data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Stock Report</h1>
          <p className="text-gray-500">
            Generated on {formatDate(reportData.generatedAt)} as of{' '}
            {formatDate(reportData.asOfDate)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => handleExport('PDF')}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('EXCEL')}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" onClick={() => handleExport('CSV')}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{reportData.summary.totalProducts}</div>
            <p className="text-sm text-gray-500">Total Products</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {formatCurrency(reportData.summary.totalValue)}
            </div>
            <p className="text-sm text-gray-500">Total Value</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{reportData.summary.lowStockCount}</div>
            <p className="text-sm text-gray-500">Low Stock Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{reportData.summary.outOfStockCount}</div>
            <p className="text-sm text-gray-500">Out of Stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Details</CardTitle>
          <p className="text-sm text-gray-500">
            {reportData.items.length} items found
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.items.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell className="font-medium">{item.sku}</TableCell>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell>{item.categoryName || 'No Category'}</TableCell>
                    <TableCell>
                      <span
                        className={
                          item.currentStock === 0
                            ? 'text-red-600 font-bold'
                            : item.currentStock <= item.minStock
                            ? 'text-yellow-600'
                            : ''
                        }
                      >
                        {item.currentStock} {item.unitName}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.averageCost)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.totalValue)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStockStatusColor(item.stockStatus)}>
                        {item.stockStatus === 'LOW' ? 'Low Stock' :
                         item.stockStatus === 'OUT' ? 'Out of Stock' : 'Normal'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}