import { ApiProperty } from '@nestjs/swagger';

export enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUST = 'ADJUST',
}

export class StockMovement {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  productId!: string;

  @ApiProperty()
  warehouseId!: string;

  @ApiProperty({ enum: MovementType })
  type!: MovementType;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  balanceAfter!: number;

  @ApiProperty()
  unitCost!: number;

  @ApiProperty()
  averageCostAfter!: number;

  @ApiProperty()
  referenceType!: string;

  @ApiProperty()
  referenceId!: string;

  @ApiProperty()
  referenceNo!: string;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty()
  companyId!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ required: false })
  product?: any;
}
