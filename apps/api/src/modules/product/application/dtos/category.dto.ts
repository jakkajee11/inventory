import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsUUID,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Category name', example: 'Electronics' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Category description', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: 'Parent category ID', required: false })
  @IsUUID()
  @IsOptional()
  parentId?: string;

  @ApiProperty({ description: 'Sort order', default: 0, required: false })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @ApiProperty({ description: 'Is category active', default: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

export class CategoryQueryDto {
  @ApiProperty({ description: 'Page number', default: 1, required: false })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiProperty({ description: 'Items per page', default: 20, required: false })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiProperty({ description: 'Search term', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ description: 'Include inactive categories', default: false, required: false })
  @IsBoolean()
  @IsOptional()
  includeInactive?: boolean;
}

export class CategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  parentId?: string;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ required: false })
  parent?: CategoryResponseDto;

  @ApiProperty({ required: false, type: [CategoryResponseDto] })
  children?: CategoryResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
