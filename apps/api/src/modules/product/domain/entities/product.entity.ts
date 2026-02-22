import { ApiProperty } from '@nestjs/swagger';
import { Category } from './category.entity';
import { Unit } from './unit.entity';

export class Product {
  @ApiProperty({ description: 'Unique identifier for the product', example: 'uuid' })
  id: string;

  @ApiProperty({ description: 'ID of the company the product belongs to' })
  companyId: string;

  @ApiProperty({ description: 'Stock Keeping Unit - unique product code', example: 'SKU-001' })
  sku: string;

  @ApiProperty({ description: 'Product barcode', required: false })
  barcode?: string;

  @ApiProperty({ description: 'Product name', example: 'Widget Pro' })
  name: string;

  @ApiProperty({ description: 'Product description', required: false })
  description?: string;

  @ApiProperty({ description: 'Category ID', required: false })
  categoryId?: string;

  @ApiProperty({ description: 'Unit ID' })
  unitId: string;

  @ApiProperty({ description: 'Cost price', example: 100.00 })
  costPrice: number;

  @ApiProperty({ description: 'Selling price', example: 150.00 })
  sellingPrice: number;

  @ApiProperty({ description: 'Minimum stock level', example: 10, default: 0 })
  minStock: number;

  @ApiProperty({ description: 'Maximum stock level', required: false })
  maxStock?: number;

  @ApiProperty({ description: 'Current stock quantity', example: 50, default: 0 })
  currentStock: number;

  @ApiProperty({ description: 'Weighted average cost', example: 95.50, default: 0 })
  averageCost: number;

  @ApiProperty({ description: 'Product image URL', required: false })
  imageUrl?: string;

  @ApiProperty({ description: 'Product images (JSON array of URLs)', required: false })
  images?: string[];

  @ApiProperty({ description: 'Whether the product is active', example: true, default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Version number for optimistic locking', example: 0, default: 0 })
  version: number;

  @ApiProperty({ description: 'Category details', required: false })
  category?: Category;

  @ApiProperty({ description: 'Unit details' })
  unit?: Unit;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Soft delete timestamp', required: false })
  deletedAt?: Date;
}
