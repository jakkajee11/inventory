'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { getMovementReportExportUrl } from '../../api/report.api';
import type { MovementReportResponse } from '../../types/report.types';

interface MovementReportProps {
  reportData: MovementReportResponse | undefined;
  isLoading: boolean;
  error: string | null;
  onRefresh?: () => void;
}

export function MovementReport({ reportData, isLoading, error, onRefresh }: MovementReportProps) {
  const handleExport = (format: 'PDF' | 'EXCEL' | 'CSV') => {
    const params = {
      startDate: reportData?.startDate,
      endDate: reportData?.endDate,
      productId: undefined, // Could be passed if filters are available
      categoryId: undefined, // Could be passed if filters are available
    };
    const url = getMovementReportExportUrl(format, params);
    window.open(url, '_blank');
  };

  const getMovementTypeColor = (type: string) => {
    if (type.includes('IN') || type.includes('RECEIPT')) {
      return 'bg-green-100 text-green-800';
    } else if (type.includes('OUT') || type.includes('ISSUE')) {
      return 'bg-red-100 text-red-800';
    } else if (type.includes('ADJUSTMENT')) {
      return 'bg-blue-100 text-blue-800';
    } else {
      return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-2xl font-bold">Movement Report</h1>
          <p className="text-gray-500">
            Period: {formatDate(reportData.startDate)} - {formatDate(reportData.endDate)}
          </p>
          <p className="text-sm text-gray-500">
            Generated on {formatDate(reportData.generatedAt)}
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{reportData.summary.totalMovements}</div>
            <p className="text-sm text-gray-500">Total Movements</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              +{formatCurrency(reportData.summary.totalIn)}
            </div>
            <p className="text-sm text-gray-500">Total In</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(reportData.summary.totalOut)}
            </div>
            <p className="text-sm text-gray-500">Total Out</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {reportData.summary.netChange >= 0 ? '+' : ''}
              {reportData.summary.netChange}
            </div>
            <p className="text-sm text-gray-500">Net Change</p>
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
      </div>

      {/* Movement Table */}
      <Card>
        <CardHeader>
          <CardTitle>Movement Details</CardTitle>
          <p className="text-sm text-gray-500">
            {reportData.items.length} movements found
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-sm">
                      {formatDate(item.movementDate)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.productName}
                      <br />
                      <span className="text-sm text-gray-500">{item.sku}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getMovementTypeColor(item.movementType)}>
                        {item.movementType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          item.quantity > 0 ? 'text-green-600' : 'text-red-600'
                        }
                      >
                        {item.quantity > 0 ? '+' : ''}{item.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.balanceAfter}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.unitCost)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.totalValue)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{item.referenceType}</p>
                        <p className="text-gray-500 text-xs">
                          #{item.referenceNumber}
                        </p>
                      </div>
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