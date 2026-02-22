import { ApiProperty } from '@nestjs/swagger';

export class Category {
  @ApiProperty({ description: 'Unique identifier for the category', example: 'uuid' })
  id: string;

  @ApiProperty({ description: 'ID of the company the category belongs to' })
  companyId: string;

  @ApiProperty({ description: 'Category name', example: 'Electronics' })
  name: string;

  @ApiProperty({ description: 'Category description', required: false })
  description?: string;

  @ApiProperty({ description: 'Parent category ID for hierarchical structure', required: false })
  parentId?: string;

  @ApiProperty({ description: 'Sort order for display', example: 0, default: 0 })
  sortOrder: number;

  @ApiProperty({ description: 'Whether the category is active', example: true, default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Parent category details', required: false })
  parent?: Category;

  @ApiProperty({ description: 'Child categories', type: [Category], required: false })
  children?: Category[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Soft delete timestamp', required: false })
  deletedAt?: Date;
}
