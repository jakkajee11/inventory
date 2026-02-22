import { ApiProperty } from '@nestjs/swagger';

export enum MovementType {
  RECEIPT = 'RECEIPT',
  ISSUE = 'ISSUE',
  ADJUSTMENT_IN = 'ADJUSTMENT_IN',
  ADJUSTMENT_OUT = 'ADJUSTMENT_OUT',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
}

export enum MovementStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
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
  balanceBefore!: number;

  @ApiProperty()
  balanceAfter!: number;

  @ApiProperty()
  unitCost!: number;

  @ApiProperty()
  averageCostBefore!: number;

  @ApiProperty()
  averageCostAfter!: number;

  @ApiProperty({ enum: MovementStatus })
  status!: MovementStatus;

  @ApiProperty({ required: false })
  referenceType?: string;

  @ApiProperty({ required: false })
  referenceId?: string;

  @ApiProperty({ required: false })
  reason?: string;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty()
  companyId!: string;

  @ApiProperty()
  createdBy!: string;

  @ApiProperty({ required: false })
  approvedBy?: string;

  @ApiProperty({ required: false })
  approvedAt?: Date;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ required: false })
  product?: any;
}
