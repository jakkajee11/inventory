import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReportService } from './report.service';

@ApiTags('reports')
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('stock')
  getStockReport(@Query() query: Record<string, unknown>) {
    return { message: 'Stock report - to be implemented', query };
  }

  @Get('movements')
  getMovementReport(@Query() query: Record<string, unknown>) {
    return { message: 'Movement report - to be implemented', query };
  }

  @Get('stock/export/pdf')
  exportStockPdf() {
    return { message: 'Export stock report to PDF - to be implemented' };
  }

  @Get('stock/export/excel')
  exportStockExcel() {
    return { message: 'Export stock report to Excel - to be implemented' };
  }
}
