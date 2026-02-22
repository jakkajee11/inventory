import { ApiProperty } from '@nestjs/swagger';

export enum ReceiptStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  CANCELLED = 'CANCELLED',
}

export class GoodsReceiptItem {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  receiptId!: string;

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

export class GoodsReceipt {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  receiptNo!: string;

  @ApiProperty()
  supplierName!: string;

  @ApiProperty({ required: false })
  supplierPhone?: string;

  @ApiProperty({ required: false })
  supplierEmail?: string;

  @ApiProperty()
  receiptDate!: Date;

  @ApiProperty({ enum: ReceiptStatus })
  status!: ReceiptStatus;

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

  @ApiProperty({ type: [GoodsReceiptItem] })
  items!: GoodsReceiptItem[];
}
