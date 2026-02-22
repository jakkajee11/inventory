import { ApiProperty } from '@nestjs/swagger';

export enum IssueStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  CANCELLED = 'CANCELLED',
}

export enum IssueType {
  SALE = 'SALE',
  PRODUCTION = 'PRODUCTION',
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER = 'TRANSFER',
  OTHER = 'OTHER',
}

export class GoodsIssueItem {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  issueId!: string;

  @ApiProperty()
  productId!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  unitCost!: number;

  @ApiProperty()
  totalCost!: number;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty({ required: false })
  product?: any;
}

export class GoodsIssue {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  issueNumber!: string;

  @ApiProperty({ enum: IssueType })
  issueType!: IssueType;

  @ApiProperty({ required: false })
  warehouseId?: string;

  @ApiProperty({ required: false })
  destination?: string;

  @ApiProperty({ required: false })
  reference?: string;

  @ApiProperty({ enum: IssueStatus })
  status!: IssueStatus;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty()
  totalAmount!: number;

  @ApiProperty()
  companyId!: string;

  @ApiProperty()
  createdById!: string;

  @ApiProperty({ required: false })
  submittedById?: string;

  @ApiProperty({ required: false })
  submittedAt?: Date;

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

  @ApiProperty({ type: [GoodsIssueItem] })
  items!: GoodsIssueItem[];
}
