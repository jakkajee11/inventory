import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ReportService } from './report.service';
import { StockReportParams, MovementReportParams } from './report.service';

@ApiTags('reports')
@Controller('reports')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('stock')
  @ApiOperation({ summary: 'Get stock report' })
  @ApiResponse({ status: 200, description: 'Stock report data' })
  async getStockReport(
    @Request() req: { user: { companyId: string } },
    @Query() query: StockReportParams,
  ) {
    return this.reportService.getStockReport(req.user.companyId, query);
  }

  @Get('movements')
  @ApiOperation({ summary: 'Get movement report' })
  @ApiResponse({ status: 200, description: 'Movement report data' })
  async getMovementReport(
    @Request() req: { user: { companyId: string } },
    @Query() query: MovementReportParams,
  ) {
    return this.reportService.getMovementReport(req.user.companyId, query);
  }

  @Get('stock/export/pdf')
  @ApiOperation({ summary: 'Export stock report to PDF' })
  @ApiResponse({ status: 200, description: 'PDF file with stock report' })
  async exportStockPdf(
    @Request() req: { user: { companyId: string } },
    @Query() query: StockReportParams,
    @Res() res: Response,
  ) {
    // TODO: Implement PDF export
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="stock-report-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.send(new Buffer('PDF export not implemented yet'));
  }

  @Get('stock/export/excel')
  @ApiOperation({ summary: 'Export stock report to Excel' })
  @ApiResponse({ status: 200, description: 'Excel file with stock report' })
  async exportStockExcel(
    @Request() req: { user: { companyId: string } },
    @Query() query: StockReportParams,
    @Res() res: Response,
  ) {
    // TODO: Implement Excel export using xlsx library
    const XLSX = await import('xlsx').then(m => m.default || m);

    const report = await this.reportService.getStockReport(req.user.companyId, query);

    // Create data sheet
    const dataRows = report.items.map(item => ({
      'SKU': item.sku,
      'Product Name': item.productName,
      'Category': item.categoryName || '',
      'Current Stock': item.currentStock,
      'Min Stock': item.minStock,
      'Average Cost': item.averageCost,
      'Total Value': item.totalValue,
      'Stock Status': item.stockStatus,
    }));

    const ws = XLSX.utils.json_to_sheet(dataRows);

    // Create summary sheet
    const summaryRows = [
      { 'Metric': 'Total Products', 'Value': report.summary.totalProducts },
      { 'Metric': 'Total Value', 'Value': report.summary.totalValue.toFixed(2) },
      { 'Metric': 'Low Stock Items', 'Value': report.summary.lowStockCount },
      { 'Metric': 'Out of Stock', 'Value': report.summary.outOfStockCount },
      { 'Metric': 'Generated At', 'Value': new Date(report.generatedAt).toLocaleString() },
    ];

    const summaryWs = XLSX.utils.json_to_sheet(summaryRows);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stock Report');
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="stock-report-${new Date().toISOString().split('T')[0]}.xlsx"`);
    res.send(buffer);
  }

  @Get('movements/export/excel')
  @ApiOperation({ summary: 'Export movement report to Excel' })
  @ApiResponse({ status: 200, description: 'Excel file with movement report' })
  async exportMovementExcel(
    @Request() req: { user: { companyId: string } },
    @Query() query: MovementReportParams,
    @Res() res: Response,
  ) {
    const XLSX = await import('xlsx').then(m => m.default || m);

    const report = await this.reportService.getMovementReport(req.user.companyId, query);

    // Create data sheet
    const dataRows = report.items.map(item => ({
      'Date': new Date(item.movementDate).toLocaleString(),
      'Product': item.productName,
      'SKU': item.sku,
      'Type': item.movementType,
      'Quantity': item.quantity,
      'Balance After': item.balanceAfter,
      'Unit Cost': item.unitCost,
      'Total Value': item.totalValue,
      'Reference Type': item.referenceType,
      'Reference Number': item.referenceNumber,
    }));

    const ws = XLSX.utils.json_to_sheet(dataRows);

    // Create summary sheet
    const summaryRows = [
      { 'Metric': 'Total Movements', 'Value': report.summary.totalMovements },
      { 'Metric': 'Total In', 'Value': report.summary.totalIn },
      { 'Metric': 'Total Out', 'Value': report.summary.totalOut },
      { 'Metric': 'Net Change', 'Value': report.summary.netChange },
      { 'Metric': 'Total Value', 'Value': report.summary.totalValue.toFixed(2) },
      { 'Metric': 'Generated At', 'Value': new Date(report.generatedAt).toLocaleString() },
    ];

    const summaryWs = XLSX.utils.json_to_sheet(summaryRows);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Movement Report');
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="movement-report-${new Date().toISOString().split('T')[0]}.xlsx"`);
    res.send(buffer);
  }
}
