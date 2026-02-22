import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsUUID,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReceiptStatus } from '../../domain/entities/goods-receipt.entity';

class GoodsReceiptItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'Quantity received' })
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @ApiProperty({ description: 'Unit cost' })
  @IsNumber()
  @Min(0)
  unitCost: number;

  @ApiProperty({ description: 'Notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateGoodsReceiptDto {
  @ApiProperty({ description: 'Supplier name' })
  @IsString()
  @IsNotEmpty()
  supplierName: string;

  @ApiProperty({ description: 'Supplier phone', required: false })
  @IsString()
  @IsOptional()
  supplierPhone?: string;

  @ApiProperty({ description: 'Supplier email', required: false })
  @IsString()
  @IsOptional()
  supplierEmail?: string;

  @ApiProperty({ description: 'Receipt date', required: false })
  @IsOptional()
  receiptDate?: Date;

  @ApiProperty({ description: 'Notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Receipt items', type: [GoodsReceiptItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoodsReceiptItemDto)
  items: GoodsReceiptItemDto[];
}

export class UpdateGoodsReceiptDto extends PartialType(CreateGoodsReceiptDto) {}

export class GoodsReceiptQueryDto {
  @ApiProperty({ description: 'Page number', default: 1, required: false })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiProperty({ description: 'Items per page', default: 20, required: false })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiProperty({ description: 'Status filter', enum: ReceiptStatus, required: false })
  @IsOptional()
  status?: ReceiptStatus;

  @ApiProperty({ description: 'Start date', required: false })
  @IsOptional()
  startDate?: Date;

  @ApiProperty({ description: 'End date', required: false })
  @IsOptional()
  endDate?: Date;
}

export class ApproveReceiptDto {
  @ApiProperty({ description: 'Approval notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CancelReceiptDto {
  @ApiProperty({ description: 'Cancellation reason' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
