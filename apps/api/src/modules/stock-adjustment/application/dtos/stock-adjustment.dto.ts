import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsUUID,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AdjustmentStatus, AdjustmentType } from '../../domain/entities/stock-adjustment.entity';

class StockAdjustmentItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'Quantity after adjustment (actual count)' })
  @IsNumber()
  quantityAfter: number;

  @ApiProperty({ description: 'Reason for this item adjustment', required: false })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class CreateStockAdjustmentDto {
  @ApiProperty({ description: 'Adjustment type', enum: AdjustmentType })
  @IsEnum(AdjustmentType)
  adjustmentType: AdjustmentType;

  @ApiProperty({ description: 'Warehouse ID', required: false })
  @IsUUID()
  @IsOptional()
  warehouseId?: string;

  @ApiProperty({ description: 'Notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Adjustment items', type: [StockAdjustmentItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockAdjustmentItemDto)
  items: StockAdjustmentItemDto[];
}

export class StockAdjustmentQueryDto {
  @ApiProperty({ description: 'Page number', default: 1, required: false })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiProperty({ description: 'Items per page', default: 20, required: false })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiProperty({ description: 'Status filter', enum: AdjustmentStatus, required: false })
  @IsOptional()
  status?: AdjustmentStatus;

  @ApiProperty({ description: 'Adjustment type filter', enum: AdjustmentType, required: false })
  @IsOptional()
  adjustmentType?: AdjustmentType;
}

export class CancelAdjustmentDto {
  @ApiProperty({ description: 'Cancellation reason' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
