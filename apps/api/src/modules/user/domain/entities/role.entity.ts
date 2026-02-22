import { ApiProperty } from '@nestjs/swagger';

export enum RoleName {
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  STAFF = 'Staff',
  VIEWER = 'Viewer',
}

export class Role {
  @ApiProperty({ description: 'Unique identifier for the role', example: 'uuid' })
  id!: string;

  @ApiProperty({ description: 'Name of the role', enum: RoleName, example: RoleName.ADMIN })
  name!: string;

  @ApiProperty({ description: 'Description of the role', example: 'Full system administrator' })
  description?: string;

  @ApiProperty({ description: 'Whether this is a system role that cannot be deleted', example: true })
  isSystem!: boolean;

  @ApiProperty({ description: 'List of permissions associated with this role' })
  permissions?: Permission[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt!: Date;
}

export class Permission {
  @ApiProperty({ description: 'Unique identifier for the permission', example: 'uuid' })
  id!: string;

  @ApiProperty({ description: 'ID of the role this permission belongs to', example: 'uuid' })
  roleId!: string;

  @ApiProperty({
    description: 'Module this permission applies to',
    example: 'products',
    enum: ['products', 'inventory', 'goods_receipt', 'goods_issue', 'stock_adjustment', 'users', 'reports', 'notifications']
  })
  module!: string;

  @ApiProperty({
    description: 'Action type',
    example: 'CREATE',
    enum: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE']
  })
  action!: string;

  @ApiProperty({ description: 'Whether this permission is granted', example: true })
  isGranted!: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt!: Date;
}
