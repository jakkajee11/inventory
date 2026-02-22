import { ApiProperty } from '@nestjs/swagger';

export enum AdjustmentStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  CANCELLED = 'CANCELLED',
}

export enum AdjustmentType {
  INVENTORY_COUNT = 'INVENTORY_COUNT',
  DAMAGE = 'DAMAGE',
  THEFT = 'THEFT',
  EXPIRATION = 'EXPIRATION',
  OTHER = 'OTHER',
}

export class StockAdjustmentItem {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  adjustmentId!: string;

  @ApiProperty()
  productId!: string;

  @ApiProperty()
  quantityBefore!: number;

  @ApiProperty()
  quantityAfter!: number;

  @ApiProperty()
  adjustment!: number;

  @ApiProperty()
  unitCost!: number;

  @ApiProperty()
  valueChange!: number;

  @ApiProperty({ required: false })
  reason?: string;

  @ApiProperty({ required: false })
  product?: any;
}

export class StockAdjustment {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  adjustmentNumber!: string;

  @ApiProperty({ enum: AdjustmentType })
  adjustmentType!: AdjustmentType;

  @ApiProperty({ required: false })
  warehouseId?: string;

  @ApiProperty({ enum: AdjustmentStatus })
  status!: AdjustmentStatus;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty()
  totalValueChange!: number;

  @ApiProperty()
  companyId!: string;

  @ApiProperty()
  createdById!: string;

  @ApiProperty({ required: false })
  approvedById?: string;

  @ApiProperty({ required: false })
  approvedAt?: Date;

  @ApiProperty({ required: false })
  cancelledById?: string;

  @ApiProperty({ required: false })
  cancelledAt?: Date;

  @ApiProperty({ required: false })
  cancellationReason?: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ type: [StockAdjustmentItem] })
  items!: StockAdjustmentItem[];
}
