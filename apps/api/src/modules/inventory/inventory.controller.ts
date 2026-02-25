import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { InventoryService, InventoryQuery, MovementQuery } from './inventory.service';
import { InventoryExportService, ExportFilter } from './inventory-export.service';
import { MovementType } from './domain/entities/stock-movement.entity';

@ApiTags('inventory')
@Controller('inventory')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly inventoryExportService: InventoryExportService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get inventory summary' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'warehouseId', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'lowStockOnly', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Inventory summary' })
  async getInventory(
    @Request() req: { user: { companyId: string } },
    @Query() query: InventoryQuery,
  ) {
    return this.inventoryService.getInventorySummary(req.user.companyId, query);
  }

  @Get('products/:productId/movements')
  @ApiOperation({ summary: 'Get stock movements for a product' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: MovementType })
  @ApiResponse({ status: 200, description: 'Stock movements' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductMovements(
    @Param('productId') productId: string,
    @Request() req: { user: { companyId: string } },
    @Query() query: MovementQuery,
  ) {
    return this.inventoryService.getProductMovements(
      productId,
      req.user.companyId,
      query,
    );
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export inventory to CSV' })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'warehouseId', required: false, type: String })
  @ApiQuery({ name: 'lowStockOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'CSV file with inventory data' })
  async exportToCSV(
    @Request() req: { user: { companyId: string } },
    @Query() query: ExportFilter,
    @Res() res: Response,
  ) {
    const buffer = await this.inventoryExportService.exportToCSV(req.user.companyId, query);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="inventory-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(buffer);
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Export inventory to Excel' })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'warehouseId', required: false, type: String })
  @ApiQuery({ name: 'lowStockOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Excel file with inventory data' })
  async exportToExcel(
    @Request() req: { user: { companyId: string } },
    @Query() query: ExportFilter,
    @Res() res: Response,
  ) {
    const buffer = await this.inventoryExportService.exportToExcel(req.user.companyId, query);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="inventory-${new Date().toISOString().split('T')[0]}.xlsx"`);
    res.send(buffer);
  }
}
