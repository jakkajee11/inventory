import { ApiProperty } from '@nestjs/swagger';

export enum AdjustmentStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  CANCELLED = 'CANCELLED',
}

export enum AdjustmentType {
  COUNT = 'COUNT',
  DAMAGE = 'DAMAGE',
  RETURN = 'RETURN',
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
  quantityDiff!: number;

  @ApiProperty()
  unitCost!: number;

  @ApiProperty()
  totalCost!: number;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty({ required: false })
  product?: any;
}

export class StockAdjustment {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  adjustmentNo!: string;

  @ApiProperty({ enum: AdjustmentType })
  adjustmentType!: AdjustmentType;

  @ApiProperty()
  adjustmentDate!: Date;

  @ApiProperty({ enum: AdjustmentStatus })
  status!: AdjustmentStatus;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty()
  totalAmount!: number;

  @ApiProperty({ required: false })
  attachments?: any;

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
