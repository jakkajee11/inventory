import { ApiProperty } from '@nestjs/swagger';
import { Role, Permission } from '../../user/domain/entities/role.entity';

export class UserResponseDto {
  @ApiProperty({ description: 'Unique identifier for the user' })
  id: string;

  @ApiProperty({ description: 'User email address' })
  email: string;

  @ApiProperty({ description: 'User full name' })
  name: string;

  @ApiProperty({ description: 'User phone number', nullable: true })
  phone?: string;

  @ApiProperty({ description: 'User avatar URL', nullable: true })
  avatar?: string;

  @ApiProperty({ description: 'ID of the user role' })
  roleId: string;

  @ApiProperty({ description: 'User role details' })
  role?: Role;

  @ApiProperty({ description: 'ID of the company the user belongs to' })
  companyId: string;

  @ApiProperty({ description: 'ID of the default warehouse', nullable: true })
  warehouseId?: string;

  @ApiProperty({ description: 'Whether the user is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Last login timestamp', nullable: true })
  lastLoginAt?: Date;

  @ApiProperty({ description: 'User permissions', type: [Permission] })
  permissions?: Permission[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'User details' })
  user: UserResponseDto;

  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @ApiProperty({ description: 'JWT refresh token' })
  refreshToken: string;

  @ApiProperty({ description: 'Access token expiration time in seconds' })
  expiresIn: number;

  @ApiProperty({ description: 'Token type' })
  tokenType: string;
}

export class LoginResponseDto extends AuthResponseDto {}

export class RegisterResponseDto extends AuthResponseDto {}

export class RefreshResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @ApiProperty({ description: 'JWT refresh token' })
  refreshToken: string;

  @ApiProperty({ description: 'Access token expiration time in seconds' })
  expiresIn: number;

  @ApiProperty({ description: 'Token type' })
  tokenType: string;
}

export class ForgotPasswordResponseDto {
  @ApiProperty({ description: 'Success message' })
  message: string;
}

export class ResetPasswordResponseDto {
  @ApiProperty({ description: 'Success message' })
  message: string;
}
