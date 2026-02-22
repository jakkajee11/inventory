import { ApiProperty } from '@nestjs/swagger';

export class Unit {
  @ApiProperty({ description: 'Unique identifier for the unit', example: 'uuid' })
  id: string;

  @ApiProperty({ description: 'ID of the company the unit belongs to' })
  companyId: string;

  @ApiProperty({ description: 'Unit name', example: 'Piece' })
  name: string;

  @ApiProperty({ description: 'Unit abbreviation', example: 'pc' })
  abbreviation: string;

  @ApiProperty({ description: 'Base unit ID for unit conversion', required: false })
  baseUnitId?: string;

  @ApiProperty({ description: 'Conversion factor to base unit', example: 1, required: false })
  conversionFactor?: number;

  @ApiProperty({ description: 'Whether the unit is active', example: true, default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Base unit details', required: false })
  baseUnit?: Unit;

  @ApiProperty({ description: 'Derived units from this base unit', type: [Unit], required: false })
  derivedUnits?: Unit[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Soft delete timestamp', required: false })
  deletedAt?: Date;
}
