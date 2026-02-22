import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsUUID,
  IsOptional,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'User password (min 8 characters, must contain uppercase, lowercase, number)',
    example: 'Password123',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password cannot exceed 128 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
    { message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' },
  )
  password: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  name: string;

  @ApiProperty({
    description: 'Company ID the user belongs to',
    example: 'uuid',
  })
  @IsUUID('4', { message: 'Company ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Company ID is required' })
  companyId: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+66 81 234 5678',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20, { message: 'Phone number cannot exceed 20 characters' })
  phone?: string;
}

export class AdminCreateUserDto extends RegisterDto {
  @ApiProperty({
    description: 'Role ID for the user',
    example: 'uuid',
  })
  @IsUUID('4', { message: 'Role ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Role ID is required' })
  roleId: string;

  @ApiProperty({
    description: 'Default warehouse ID',
    example: 'uuid',
    required: false,
  })
  @IsUUID('4', { message: 'Warehouse ID must be a valid UUID' })
  @IsOptional()
  warehouseId?: string;
}
