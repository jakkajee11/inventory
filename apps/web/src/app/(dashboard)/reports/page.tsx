'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useStockReport, useMovementReport, getStockReportExportUrl, getMovementReportExportUrl } from '@/features/report/api/report.api';
import { Download, FileText, TrendingUp } from 'lucide-react';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('stock');
  const [stockParams, setStockParams] = useState({ page: 1, limit: 20 });
  const [movementParams, setMovementParams] = useState({ page: 1, limit: 20 });

  const { data: stockReport, isLoading: stockLoading } = useStockReport(stockParams);
  const { data: movementReport, isLoading: movementLoading } = useMovementReport(movementParams);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-gray-500">Generate and export inventory reports</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="stock">
            <FileText className="h-4 w-4 mr-2" />
            Stock Report
          </TabsTrigger>
          <TabsTrigger value="movements">
            <TrendingUp className="h-4 w-4 mr-2" />
            Movement Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Generated: {stockReport?.generatedAt ? new Date(stockReport.generatedAt).toLocaleString() : '-'}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.open(getStockReportExportUrl('CSV'), '_blank')}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open(getStockReportExportUrl('EXCEL'), '_blank')}>
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>

          {/* Stock Summary */}
          {stockReport && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stockReport.summary.totalProducts}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">THB {stockReport.summary.totalValue.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-yellow-600">{stockReport.summary.lowStockCount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-600">{stockReport.summary.outOfStockCount}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Stock Table */}
          <Card>
            <CardContent className="pt-6">
              {stockLoading ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                </div>
              ) : stockReport?.items ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Avg Cost</TableHead>
                      <TableHead className="text-right">Total Value</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockReport.items.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell className="font-medium">{item.sku}</TableCell>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell>{item.categoryName || '-'}</TableCell>
                        <TableCell className="text-right">{item.currentStock} {item.unitName}</TableCell>
                        <TableCell className="text-right">THB {item.averageCost.toFixed(2)}</TableCell>
                        <TableCell className="text-right">THB {item.totalValue.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={item.stockStatus === 'NORMAL' ? 'default' : item.stockStatus === 'LOW' ? 'secondary' : 'destructive'}>
                            {item.stockStatus}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10 text-gray-500">No data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Period: {movementReport?.startDate ? new Date(movementReport.startDate).toLocaleDateString() : '-'} - {movementReport?.endDate ? new Date(movementReport.endDate).toLocaleDateString() : '-'}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.open(getMovementReportExportUrl('CSV'), '_blank')}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open(getMovementReportExportUrl('EXCEL'), '_blank')}>
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>

          {/* Movement Summary */}
          {movementReport && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Movements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{movementReport.summary.totalMovements}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total In</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">{movementReport.summary.totalIn}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Out</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-600">{movementReport.summary.totalOut}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Net Change</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-2xl font-bold ${movementReport.summary.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {movementReport.summary.netChange >= 0 ? '+' : ''}{movementReport.summary.netChange}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">THB {movementReport.summary.totalValue.toFixed(2)}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Movement Table */}
          <Card>
            <CardContent className="pt-6">
              {movementLoading ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                </div>
              ) : movementReport?.items ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movementReport.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{new Date(item.movementDate).toLocaleDateString()}</TableCell>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell>
                          <Badge variant={item.quantity > 0 ? 'default' : 'secondary'}>
                            {item.movementType}
                          </Badge>
                        </TableCell>
                        <TableCell className={`text-right font-medium ${item.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.quantity > 0 ? '+' : ''}{item.quantity}
                        </TableCell>
                        <TableCell className="text-right">{item.balanceAfter}</TableCell>
                        <TableCell>{item.referenceType}: {item.referenceNumber}</TableCell>
                        <TableCell className="text-right">THB {item.totalValue.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10 text-gray-500">No data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
