import { Injectable } from '@nestjs/common';
import { StockReportResponseDto, MovementReportResponseDto } from '../application/dtos/report.dto';

@Injectable()
export class ExcelExportService {
  async exportStockReport(report: StockReportResponseDto): Promise<Buffer> {
    // Generate CSV content (can be opened in Excel)
    const csv = this.generateStockReportCsv(report);
    return Buffer.from(csv, 'utf-8');
  }

  async exportMovementReport(report: MovementReportResponseDto): Promise<Buffer> {
    const csv = this.generateMovementReportCsv(report);
    return Buffer.from(csv, 'utf-8');
  }

  private generateStockReportCsv(report: StockReportResponseDto): string {
    const headers = ['SKU', 'Product', 'Category', 'Stock', 'Unit', 'Avg Cost', 'Total Value', 'Status'];
    const rows = report.items.map(item => [
      item.sku,
      item.productName,
      item.categoryName || '',
      item.currentStock.toString(),
      item.unitName,
      item.averageCost.toFixed(2),
      item.totalValue.toFixed(2),
      item.stockStatus,
    ]);

    const summary = [
      '',
      '',
      'Summary',
      '',
      '',
      '',
      '',
      '',
    ];

    const summaryData = [
      ['', '', 'Total Products', report.summary.totalProducts.toString(), '', '', '', ''],
      ['', '', 'Total Value', `฿${report.summary.totalValue.toFixed(2)}`, '', '', '', ''],
      ['', '', 'Low Stock Items', report.summary.lowStockCount.toString(), '', '', '', ''],
      ['', '', 'Out of Stock', report.summary.outOfStockCount.toString(), '', '', '', ''],
    ];

    return [
      `Stock Report - As of: ${report.asOfDate.toLocaleDateString()}`,
      `Generated: ${report.generatedAt.toLocaleString()}`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(',')),
      '',
      ...summaryData.map(row => row.join(',')),
    ].join('\n');
  }

  private generateMovementReportCsv(report: MovementReportResponseDto): string {
    const headers = ['Date', 'SKU', 'Product', 'Type', 'Quantity', 'Balance After', 'Reference', 'Value'];
    const rows = report.items.map(item => [
      item.movementDate.toLocaleDateString(),
      item.sku,
      item.productName,
      item.movementType,
      item.quantity.toString(),
      item.balanceAfter.toString(),
      `${item.referenceType}: ${item.referenceNumber}`,
      item.totalValue.toFixed(2),
    ]);

    return [
      `Movement Report - Period: ${report.startDate.toLocaleDateString()} to ${report.endDate.toLocaleDateString()}`,
      `Generated: ${report.generatedAt.toLocaleString()}`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(',')),
      '',
      'Summary',
      `Total Movements,${report.summary.totalMovements}`,
      `Total In,${report.summary.totalIn}`,
      `Total Out,${report.summary.totalOut}`,
      `Net Change,${report.summary.netChange}`,
      `Total Value,฿${report.summary.totalValue.toFixed(2)}`,
    ].join('\n');
  }
}
