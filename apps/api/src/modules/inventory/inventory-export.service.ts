import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface ExportFilter {
  categoryId?: string;
  warehouseId?: string;
  lowStockOnly?: boolean;
  includeInactive?: boolean;
}

export interface InventoryExportItem {
  sku: string;
  productName: string;
  category: string;
  currentStock: number;
  unit: string;
  averageCost: number;
  totalValue: number;
  minStock: number;
  maxStock?: number;
  stockStatus: 'Normal' | 'Low Stock' | 'Out of Stock';
  lastMovementDate?: Date;
}

@Injectable()
export class InventoryExportService {
  private readonly logger = new Logger(InventoryExportService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getExportData(companyId: string, filter?: ExportFilter): Promise<InventoryExportItem[]> {
    const products = await this.prisma.product.findMany({
      where: {
        companyId,
        deletedAt: null,
        ...(filter?.includeInactive ? {} : { isActive: true }),
        ...(filter?.categoryId && { categoryId: filter.categoryId }),
      },
      include: {
        category: true,
        unit: true,
      },
      orderBy: { sku: 'asc' },
    });

    // Get last movement dates for all products
    const productIds = products.map(p => p.id);
    const lastMovements = await this.prisma.stockMovement.groupBy({
      by: ['productId'],
      where: {
        productId: { in: productIds },
        companyId,
      },
      _max: {
        createdAt: true,
      },
    });

    const lastMovementMap = new Map(
      lastMovements.map(m => [m.productId, m._max.createdAt]),
    );

    const items: (InventoryExportItem | null)[] = products
      .map(product => {
        const currentStock = product.currentStock;
        const minStock = product.minStock;
        const maxStock = product.maxStock;

        let stockStatus: 'Normal' | 'Low Stock' | 'Out of Stock';
        if (currentStock === 0) {
          stockStatus = 'Out of Stock';
        } else if (currentStock <= minStock) {
          stockStatus = 'Low Stock';
        } else {
          stockStatus = 'Normal';
        }

        // Filter by low stock if requested
        if (filter?.lowStockOnly && stockStatus === 'Normal') {
          return null;
        }

        const averageCost = Number(product.averageCost);
        const totalValue = currentStock * averageCost;

        return {
          sku: product.sku,
          productName: product.name,
          category: product.category?.name || '',
          currentStock,
          unit: product.unit?.name || '',
          averageCost,
          totalValue,
          minStock,
          maxStock: maxStock || undefined,
          stockStatus,
          lastMovementDate: lastMovementMap.get(product.id) || undefined,
        };
      });

    return items.filter((item): item is InventoryExportItem => item !== null);

    return items;
  }

  async exportToCSV(companyId: string, filter?: ExportFilter): Promise<Buffer> {
    const items = await this.getExportData(companyId, filter);

    const headers = [
      'SKU',
      'Product Name',
      'Category',
      'Current Stock',
      'Unit',
      'Average Cost',
      'Total Value',
      'Min Stock',
      'Max Stock',
      'Stock Status',
      'Last Movement Date',
    ];

    const rows = items.map(item => [
      this.escapeCSV(item.sku),
      this.escapeCSV(item.productName),
      this.escapeCSV(item.category),
      item.currentStock.toString(),
      this.escapeCSV(item.unit),
      item.averageCost.toFixed(2),
      item.totalValue.toFixed(2),
      item.minStock.toString(),
      item.maxStock?.toString() || '',
      item.stockStatus,
      item.lastMovementDate ? new Date(item.lastMovementDate).toLocaleDateString() : '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    return Buffer.from(csv, 'utf-8');
  }

  async exportToExcel(companyId: string, filter?: ExportFilter): Promise<Buffer> {
    const XLSX = await import('xlsx').then(m => m.default || m);
    const items = await this.getExportData(companyId, filter);

    // Calculate summary
    const summary = {
      totalProducts: items.length,
      totalValue: items.reduce((sum, item) => sum + item.totalValue, 0),
      lowStockCount: items.filter(i => i.stockStatus === 'Low Stock').length,
      outOfStockCount: items.filter(i => i.stockStatus === 'Out of Stock').length,
      normalCount: items.filter(i => i.stockStatus === 'Normal').length,
    };

    // Create main data sheet
    const dataRows = items.map(item => ({
      'SKU': item.sku,
      'Product Name': item.productName,
      'Category': item.category,
      'Current Stock': item.currentStock,
      'Unit': item.unit,
      'Average Cost': item.averageCost,
      'Total Value': item.totalValue,
      'Min Stock': item.minStock,
      'Max Stock': item.maxStock || '',
      'Stock Status': item.stockStatus,
      'Last Movement': item.lastMovementDate ? new Date(item.lastMovementDate).toLocaleDateString() : '',
    }));

    const ws = XLSX.utils.json_to_sheet(dataRows);

    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, // SKU
      { wch: 30 }, // Product Name
      { wch: 20 }, // Category
      { wch: 12 }, // Current Stock
      { wch: 10 }, // Unit
      { wch: 12 }, // Average Cost
      { wch: 12 }, // Total Value
      { wch: 10 }, // Min Stock
      { wch: 10 }, // Max Stock
      { wch: 12 }, // Stock Status
      { wch: 15 }, // Last Movement
    ];

    // Create summary sheet
    const summaryRows = [
      { 'Metric': 'Total Products', 'Value': summary.totalProducts },
      { 'Metric': 'Total Value', 'Value': summary.totalValue.toFixed(2) },
      { 'Metric': 'Normal Stock', 'Value': summary.normalCount },
      { 'Metric': 'Low Stock Items', 'Value': summary.lowStockCount },
      { 'Metric': 'Out of Stock', 'Value': summary.outOfStockCount },
      { 'Metric': 'Generated At', 'Value': new Date().toLocaleString() },
    ];

    const summaryWs = XLSX.utils.json_to_sheet(summaryRows);
    summaryWs['!cols'] = [{ wch: 20 }, { wch: 20 }];

    // Create workbook and add sheets
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
