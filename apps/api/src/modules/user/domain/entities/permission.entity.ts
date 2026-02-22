import { ApiProperty } from '@nestjs/swagger';

export enum PermissionModule {
  PRODUCTS = 'products',
  INVENTORY = 'inventory',
  GOODS_RECEIPT = 'goods_receipt',
  GOODS_ISSUE = 'goods_issue',
  STOCK_ADJUSTMENT = 'stock_adjustment',
  USERS = 'users',
  REPORTS = 'reports',
  NOTIFICATIONS = 'notifications',
}

export enum PermissionAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
}

export class PermissionEntity {
  @ApiProperty({ description: 'Unique identifier for the permission' })
  id!: string;

  @ApiProperty({ description: 'ID of the role this permission belongs to' })
  roleId!: string;

  @ApiProperty({
    description: 'Module this permission applies to',
    enum: PermissionModule,
  })
  module!: PermissionModule;

  @ApiProperty({
    description: 'Action type',
    enum: PermissionAction,
  })
  action!: PermissionAction;

  @ApiProperty({ description: 'Whether this permission is granted' })
  isGranted!: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt!: Date;
}
