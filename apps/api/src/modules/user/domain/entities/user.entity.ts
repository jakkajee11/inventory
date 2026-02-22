import { ApiProperty } from '@nestjs/swagger';
import { Role, Permission } from './role.entity';

export class User {
  @ApiProperty({ description: 'Unique identifier for the user', example: 'uuid' })
  id!: string;

  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  email!: string;

  @ApiProperty({ description: 'Hashed password', example: '********' })
  passwordHash!: string;

  @ApiProperty({ description: 'User full name', example: 'John Doe' })
  name!: string;

  @ApiProperty({ description: 'User phone number', example: '+66 81 234 5678', required: false })
  phone?: string;

  @ApiProperty({ description: 'User avatar URL', required: false })
  avatar?: string;

  @ApiProperty({ description: 'ID of the user role' })
  roleId!: string;

  @ApiProperty({ description: 'ID of the company the user belongs to' })
  companyId!: string;

  @ApiProperty({ description: 'ID of the default warehouse', required: false })
  warehouseId?: string;

  @ApiProperty({ description: 'Whether the user is active', example: true })
  isActive!: boolean;

  @ApiProperty({ description: 'Last login timestamp', required: false })
  lastLoginAt?: Date;

  @ApiProperty({ description: 'User role details' })
  role?: Role;

  @ApiProperty({ description: 'User permissions flattened from role' })
  permissions?: Permission[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt!: Date;

  @ApiProperty({ description: 'Soft delete timestamp', required: false })
  deletedAt?: Date;
}

export type UserWithoutPassword = Omit<User, 'passwordHash'>;
