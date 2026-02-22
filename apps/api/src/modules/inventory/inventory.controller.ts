import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Request,
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
import { InventoryService, InventoryQuery, MovementQuery } from './inventory.service';
import { MovementType } from './domain/entities/stock-movement.entity';

@ApiTags('inventory')
@Controller('inventory')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

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
}
