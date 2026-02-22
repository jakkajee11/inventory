import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { StockAdjustmentService } from './stock-adjustment.service';
import {
  CreateStockAdjustmentDto,
  StockAdjustmentQueryDto,
  CancelAdjustmentDto,
} from './application/dtos/stock-adjustment.dto';

@ApiTags('stock-adjustments')
@Controller('stock-adjustments')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class StockAdjustmentController {
  constructor(private readonly adjustmentService: StockAdjustmentService) {}

  @Get()
  @ApiOperation({ summary: 'Get all stock adjustments' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of stock adjustments' })
  async findAll(
    @Request() req: { user: { companyId: string } },
    @Query() query: StockAdjustmentQueryDto,
  ) {
    return this.adjustmentService.findAll(req.user.companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get stock adjustment by ID' })
  @ApiParam({ name: 'id', description: 'Adjustment ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Adjustment details' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Adjustment not found' })
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ) {
    return this.adjustmentService.findById(id, req.user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new stock adjustment' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Adjustment created' })
  async create(
    @Body() dto: CreateStockAdjustmentDto,
    @Request() req: { user: { companyId: string; id: string } },
  ) {
    return this.adjustmentService.create(req.user.companyId, req.user.id, dto);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit stock adjustment for approval' })
  @ApiParam({ name: 'id', description: 'Adjustment ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Adjustment submitted' })
  async submit(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string; id: string } },
  ) {
    return this.adjustmentService.submit(id, req.user.companyId, req.user.id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve stock adjustment' })
  @ApiParam({ name: 'id', description: 'Adjustment ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Adjustment approved' })
  async approve(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string; id: string } },
  ) {
    return this.adjustmentService.approve(id, req.user.companyId, req.user.id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel stock adjustment' })
  @ApiParam({ name: 'id', description: 'Adjustment ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Adjustment cancelled' })
  async cancel(
    @Param('id') id: string,
    @Body() dto: CancelAdjustmentDto,
    @Request() req: { user: { companyId: string; id: string } },
  ) {
    return this.adjustmentService.cancel(id, req.user.companyId, req.user.id, dto.reason);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a draft stock adjustment' })
  @ApiParam({ name: 'id', description: 'Adjustment ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Adjustment deleted' })
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ) {
    return this.adjustmentService.delete(id, req.user.companyId);
  }
}
