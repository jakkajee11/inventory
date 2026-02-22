import { ApiProperty } from '@nestjs/swagger';

export enum NotificationType {
  LOW_STOCK = 'LOW_STOCK',
  ZERO_STOCK = 'ZERO_STOCK',
  RECEIPT_APPROVED = 'RECEIPT_APPROVED',
  ISSUE_APPROVED = 'ISSUE_APPROVED',
  ADJUSTMENT_APPROVED = 'ADJUSTMENT_APPROVED',
  SYSTEM = 'SYSTEM',
}

export class Notification {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty({ enum: NotificationType })
  type!: NotificationType;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  message!: string;

  @ApiProperty({ required: false })
  data?: Record<string, any>;

  @ApiProperty()
  isRead!: boolean;

  @ApiProperty({ required: false })
  readAt?: Date;

  @ApiProperty()
  companyId!: string;

  @ApiProperty()
  createdAt!: Date;
}
