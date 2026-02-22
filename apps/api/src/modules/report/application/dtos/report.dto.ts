import { IsOptional, IsDateString, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum ReportType {
  STOCK = 'STOCK',
  MOVEMENT = 'MOVEMENT',
}

export enum ExportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV',
}

export class StockReportQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  asOfDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 50;
}

export class MovementReportQueryDto {
  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 50;
}

export class ExportReportDto {
  @ApiPropertyOptional({ enum: ExportFormat })
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @ApiPropertyOptional({ enum: ReportType })
  @IsEnum(ReportType)
  type: ReportType;
}

export class StockReportItemDto {
  productId: string;
  sku: string;
  productName: string;
  categoryName: string | null;
  unitName: string;
  currentStock: number;
  minStock: number;
  averageCost: number;
  totalValue: number;
  stockStatus: 'LOW' | 'NORMAL' | 'HIGH';
}

export class MovementReportItemDto {
  id: string;
  movementDate: Date;
  productName: string;
  sku: string;
  movementType: string;
  quantity: number;
  balanceAfter: number;
  referenceType: string;
  referenceNumber: string;
  unitCost: number;
  totalValue: number;
}

export class StockReportResponseDto {
  asOfDate: Date;
  generatedAt: Date;
  items: StockReportItemDto[];
  summary: {
    totalProducts: number;
    totalValue: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class MovementReportResponseDto {
  startDate: Date;
  endDate: Date;
  generatedAt: Date;
  items: MovementReportItemDto[];
  summary: {
    totalMovements: number;
    totalIn: number;
    totalOut: number;
    netChange: number;
    totalValue: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
