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
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IssueStatus, IssueType } from '../../domain/entities/goods-issue.entity';

class GoodsIssueItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'Quantity to issue' })
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @ApiProperty({ description: 'Notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateGoodsIssueDto {
  @ApiProperty({ description: 'Issue type', enum: IssueType })
  @IsEnum(IssueType)
  issueType: IssueType;

  @ApiProperty({ description: 'Recipient name', required: false })
  @IsString()
  @IsOptional()
  recipientName?: string;

  @ApiProperty({ description: 'Recipient phone', required: false })
  @IsString()
  @IsOptional()
  recipientPhone?: string;

  @ApiProperty({ description: 'Recipient email', required: false })
  @IsString()
  @IsOptional()
  recipientEmail?: string;

  @ApiProperty({ description: 'Issue date', required: false })
  @IsOptional()
  issueDate?: Date;

  @ApiProperty({ description: 'Notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Issue items', type: [GoodsIssueItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoodsIssueItemDto)
  items: GoodsIssueItemDto[];
}

export class UpdateGoodsIssueDto extends PartialType(CreateGoodsIssueDto) {}

export class GoodsIssueQueryDto {
  @ApiProperty({ description: 'Page number', default: 1, required: false })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiProperty({ description: 'Items per page', default: 20, required: false })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiProperty({ description: 'Status filter', enum: IssueStatus, required: false })
  @IsOptional()
  status?: IssueStatus;

  @ApiProperty({ description: 'Issue type filter', enum: IssueType, required: false })
  @IsOptional()
  issueType?: IssueType;

  @ApiProperty({ description: 'Start date', required: false })
  @IsOptional()
  startDate?: Date;

  @ApiProperty({ description: 'End date', required: false })
  @IsOptional()
  endDate?: Date;
}

export class CancelIssueDto {
  @ApiProperty({ description: 'Cancellation reason' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
