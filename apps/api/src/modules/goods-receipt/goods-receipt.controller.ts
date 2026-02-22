import {
  Controller,
  Get,
  Post,
  Put,
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
import { GoodsReceiptService } from './goods-receipt.service';
import {
  CreateGoodsReceiptDto,
  UpdateGoodsReceiptDto,
  GoodsReceiptQueryDto,
  ApproveReceiptDto,
  CancelReceiptDto,
} from './application/dtos/goods-receipt.dto';

@ApiTags('goods-receipts')
@Controller('goods-receipts')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class GoodsReceiptController {
  constructor(private readonly receiptService: GoodsReceiptService) {}

  @Get()
  @ApiOperation({ summary: 'Get all goods receipts' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of goods receipts' })
  async findAll(
    @Request() req: { user: { companyId: string } },
    @Query() query: GoodsReceiptQueryDto,
  ) {
    return this.receiptService.findAll(req.user.companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get goods receipt by ID' })
  @ApiParam({ name: 'id', description: 'Receipt ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Receipt details' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Receipt not found' })
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ) {
    return this.receiptService.findById(id, req.user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new goods receipt' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Receipt created' })
  async create(
    @Body() dto: CreateGoodsReceiptDto,
    @Request() req: { user: { companyId: string; id: string } },
  ) {
    return this.receiptService.create(req.user.companyId, req.user.id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a goods receipt' })
  @ApiParam({ name: 'id', description: 'Receipt ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Receipt updated' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateGoodsReceiptDto,
    @Request() req: { user: { companyId: string } },
  ) {
    return this.receiptService.update(id, req.user.companyId, dto);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit goods receipt for approval' })
  @ApiParam({ name: 'id', description: 'Receipt ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Receipt submitted' })
  async submit(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string; id: string } },
  ) {
    return this.receiptService.submit(id, req.user.companyId, req.user.id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve goods receipt' })
  @ApiParam({ name: 'id', description: 'Receipt ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Receipt approved' })
  async approve(
    @Param('id') id: string,
    @Body() dto: ApproveReceiptDto,
    @Request() req: { user: { companyId: string; id: string } },
  ) {
    return this.receiptService.approve(id, req.user.companyId, req.user.id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel goods receipt' })
  @ApiParam({ name: 'id', description: 'Receipt ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Receipt cancelled' })
  async cancel(
    @Param('id') id: string,
    @Body() dto: CancelReceiptDto,
    @Request() req: { user: { companyId: string; id: string } },
  ) {
    return this.receiptService.cancel(id, req.user.companyId, req.user.id, dto.reason);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a draft goods receipt' })
  @ApiParam({ name: 'id', description: 'Receipt ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Receipt deleted' })
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ) {
    return this.receiptService.delete(id, req.user.companyId);
  }
}
