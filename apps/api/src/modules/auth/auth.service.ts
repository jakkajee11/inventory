import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../user/infrastructure/user.repository';
import { User } from '../user/domain/entities/user.entity';
import { RegisterDto, AdminCreateUserDto } from './application/dtos/register.dto';
import { LoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto } from './application/dtos/login.dto';
import {
  AuthResponseDto,
  LoginResponseDto,
  RegisterResponseDto,
  RefreshResponseDto,
  ForgotPasswordResponseDto,
  ResetPasswordResponseDto,
  UserResponseDto,
} from './application/dtos/auth-response.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly saltRounds = 12;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Validate user credentials
   */
  async validateUser(email: string, password: string, companyId?: string): Promise<User | null> {
    // If companyId is provided, use it for the lookup
    const user = companyId
      ? await this.userRepository.findByEmailWithRole(email, companyId)
      : await this.findUserByEmailAcrossCompanies(email);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Register a new user (self-registration)
   */
  async register(dto: RegisterDto): Promise<RegisterResponseDto> {
    // Check if email already exists in company
    const emailExists = await this.userRepository.emailExists(dto.email, dto.companyId);
    if (emailExists) {
      throw new ConflictException('Email already registered in this company');
    }

    // Verify company exists
    const company = await this.prisma.company.findUnique({
      where: { id: dto.companyId },
    });

    if (!company) {
      throw new BadRequestException('Company not found');
    }

    if (!company.isActive) {
      throw new BadRequestException('Company is not active');
    }

    // Get default Staff role
    const staffRole = await this.prisma.role.findFirst({
      where: { name: 'Staff' },
    });

    if (!staffRole) {
      throw new BadRequestException('Default Staff role not found. Please seed roles first.');
    }

    // Hash password
    const passwordHash = await this.hashPassword(dto.password);

    // Create user
    const user = await this.userRepository.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      roleId: staffRole.id,
      companyId: dto.companyId,
      phone: dto.phone,
    });

    this.logger.log(`User registered: ${user.email} in company ${user.companyId}`);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: this.mapUserToResponse(user),
      ...tokens,
    };
  }

  /**
   * Login user
   */
  async login(dto: LoginDto, companyId?: string): Promise<LoginResponseDto> {
    const user = await this.validateUser(dto.email, dto.password, companyId);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login
    await this.userRepository.updateLastLogin(user.id);

    this.logger.log(`User logged in: ${user.email}`);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: this.mapUserToResponse(user),
      ...tokens,
    };
  }

  /**
   * Refresh tokens
   */
  async refreshTokens(dto: RefreshTokenDto): Promise<RefreshResponseDto> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify<JwtPayload>(dto.refreshToken, {
        secret: this.configService.get<string>('jwt.secret') || 'your-super-secret-key-change-in-production',
      });

      // Get fresh user data
      const user = await this.userRepository.findByIdWithPermissions(payload.sub);

      if (!user || !user.isActive || user.deletedAt) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      this.logger.log(`Tokens refreshed for user: ${user.email}`);

      return tokens;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Forgot password - send reset email
   */
  async forgotPassword(dto: ForgotPasswordDto, companyId?: string): Promise<ForgotPasswordResponseDto> {
    // Find user by email
    const user = companyId
      ? await this.userRepository.findByEmail(dto.email, companyId)
      : await this.findUserByEmailAcrossCompanies(dto.email);

    if (!user) {
      // Don't reveal if user exists or not for security
      this.logger.warn(`Forgot password requested for non-existent email: ${dto.email}`);
      return { message: 'If the email exists, a reset link has been sent' };
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = this.jwtService.sign(
      { sub: user.id, email: user.email, type: 'reset' },
      {
        secret: this.configService.get<string>('jwt.secret') || 'your-super-secret-key-change-in-production',
        expiresIn: '1h',
      },
    );

    // TODO: Send email with reset link
    // For now, just log it (in production, integrate with email service)
    this.logger.log(`Password reset token generated for: ${user.email}. Token: ${resetToken.substring(0, 20)}...`);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  /**
   * Reset password with token
   */
  async resetPassword(dto: ResetPasswordDto): Promise<ResetPasswordResponseDto> {
    try {
      // Verify reset token
      const payload = this.jwtService.verify<{ sub: string; email: string; type: string }>(
        dto.token,
        {
          secret: this.configService.get<string>('jwt.secret') || 'your-super-secret-key-change-in-production',
        },
      );

      if (payload.type !== 'reset') {
        throw new BadRequestException('Invalid reset token');
      }

      // Get user
      const user = await this.userRepository.findById(payload.sub);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Hash new password
      const passwordHash = await this.hashPassword(dto.password);

      // Update password
      await this.userRepository.update(user.id, { passwordHash });

      this.logger.log(`Password reset for user: ${user.email}`);

      return { message: 'Password has been reset successfully' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Invalid or expired reset token');
    }
  }

  /**
   * Generate access and refresh tokens
   */
  async generateTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
  }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      companyId: user.companyId,
      roleId: user.roleId,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.secret') || 'your-super-secret-key-change-in-production',
      expiresIn: this.configService.get<string>('jwt.expiresIn') || '24h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.secret') || 'your-super-secret-key-change-in-production',
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn') || '7d',
    });

    // Calculate expiration in seconds
    const expiresIn = this.parseTimeToSeconds(
      this.configService.get<string>('jwt.expiresIn') || '24h',
    );

    return {
      accessToken,
      refreshToken,
      expiresIn,
      tokenType: 'Bearer',
    };
  }

  /**
   * Hash password
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Find user by email across all companies (for login without company context)
   */
  private async findUserByEmailAcrossCompanies(email: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) return null;

    // Map to entity
    const entity = new User();
    entity.id = user.id;
    entity.email = user.email;
    entity.passwordHash = user.passwordHash;
    entity.name = user.name;
    entity.phone = user.phone ?? undefined;
    entity.avatar = user.avatar ?? undefined;
    entity.roleId = user.roleId;
    entity.companyId = user.companyId;
    entity.warehouseId = user.warehouseId ?? undefined;
    entity.isActive = user.isActive;
    entity.lastLoginAt = user.lastLoginAt ?? undefined;
    entity.createdAt = user.createdAt;
    entity.updatedAt = user.updatedAt;
    entity.deletedAt = user.deletedAt ?? undefined;

    if (user.role) {
      entity.role = {
        id: user.role.id,
        name: user.role.name,
        description: user.role.description ?? undefined,
        isSystem: user.role.isSystem,
        createdAt: user.role.createdAt,
        updatedAt: user.role.updatedAt,
        permissions: user.role.permissions?.map((p) => ({
          id: p.id,
          roleId: p.roleId,
          module: p.module,
          action: p.action,
          isGranted: p.isGranted,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        })),
      };
      entity.permissions = entity.role.permissions;
    }

    return entity;
  }

  /**
   * Parse time string to seconds
   */
  private parseTimeToSeconds(timeStr: string): number {
    const unit = timeStr.slice(-1);
    const value = parseInt(timeStr.slice(0, -1), 10);

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 60 * 60 * 24;
      default:
        return 86400; // Default 24 hours
    }
  }

  /**
   * Map user entity to response DTO
   */
  private mapUserToResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      roleId: user.roleId,
      role: user.role,
      companyId: user.companyId,
      warehouseId: user.warehouseId,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      permissions: user.permissions,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
