import { Injectable } from '@nestjs/common';
import { StockReportResponseDto, MovementReportResponseDto } from '../application/dtos/report.dto';

@Injectable()
export class PdfExportService {
  async exportStockReport(report: StockReportResponseDto): Promise<Buffer> {
    // Generate HTML content for PDF
    const html = this.generateStockReportHtml(report);

    // For now, return the HTML as buffer (in production, use a PDF library like puppeteer or pdfkit)
    return Buffer.from(html, 'utf-8');
  }

  async exportMovementReport(report: MovementReportResponseDto): Promise<Buffer> {
    const html = this.generateMovementReportHtml(report);
    return Buffer.from(html, 'utf-8');
  }

  private generateStockReportHtml(report: StockReportResponseDto): string {
    const rows = report.items.map(item => `
      <tr>
        <td>${item.sku}</td>
        <td>${item.productName}</td>
        <td>${item.categoryName || '-'}</td>
        <td>${item.currentStock} ${item.unitName}</td>
        <td>฿${item.averageCost.toFixed(2)}</td>
        <td>฿${item.totalValue.toFixed(2)}</td>
        <td>${item.stockStatus}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Stock Report</title>
        <style>
          body { font-family: Arial, sans-serif; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f4f4f4; }
          .summary { margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>Stock Report</h1>
        <p>As of: ${report.asOfDate.toLocaleDateString()}</p>
        <p>Generated: ${report.generatedAt.toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Avg Cost</th>
              <th>Total Value</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="summary">
          <h2>Summary</h2>
          <p>Total Products: ${report.summary.totalProducts}</p>
          <p>Total Value: ฿${report.summary.totalValue.toFixed(2)}</p>
          <p>Low Stock Items: ${report.summary.lowStockCount}</p>
          <p>Out of Stock: ${report.summary.outOfStockCount}</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateMovementReportHtml(report: MovementReportResponseDto): string {
    const rows = report.items.map(item => `
      <tr>
        <td>${item.movementDate.toLocaleDateString()}</td>
        <td>${item.sku}</td>
        <td>${item.productName}</td>
        <td>${item.movementType}</td>
        <td>${item.quantity}</td>
        <td>${item.balanceAfter}</td>
        <td>${item.referenceType}: ${item.referenceNumber}</td>
        <td>฿${item.totalValue.toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Movement Report</title>
        <style>
          body { font-family: Arial, sans-serif; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f4f4f4; }
          .summary { margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>Movement Report</h1>
        <p>Period: ${report.startDate.toLocaleDateString()} - ${report.endDate.toLocaleDateString()}</p>
        <p>Generated: ${report.generatedAt.toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>SKU</th>
              <th>Product</th>
              <th>Type</th>
              <th>Qty</th>
              <th>Balance</th>
              <th>Reference</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="summary">
          <h2>Summary</h2>
          <p>Total Movements: ${report.summary.totalMovements}</p>
          <p>Total In: ${report.summary.totalIn}</p>
          <p>Total Out: ${report.summary.totalOut}</p>
          <p>Net Change: ${report.summary.netChange}</p>
          <p>Total Value: ฿${report.summary.totalValue.toFixed(2)}</p>
        </div>
      </body>
      </html>
    `;
  }
}
