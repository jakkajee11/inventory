import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './infrastructure/user.repository';
import { User } from './domain/entities/user.entity';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  roleId: string;
  companyId: string;
  phone?: string;
  warehouseId?: string;
}

export interface UpdateUserData {
  name?: string;
  phone?: string;
  avatar?: string;
  roleId?: string;
  warehouseId?: string;
  isActive?: boolean;
  password?: string;
  passwordHash?: string;
}

export interface FindAllOptions {
  page?: number;
  limit?: number;
  includeInactive?: boolean;
}

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly saltRounds = 12;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Find user by ID
   */
  async findById(id: string, companyId: string): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Ensure user belongs to the same company
    if (user.companyId !== companyId) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Find all users in a company
   */
  async findAll(companyId: string, options: FindAllOptions = {}): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100); // Max 100 per page
    const skip = (page - 1) * limit;

    const { users, total } = await this.userRepository.findAllByCompanyId(companyId, {
      skip,
      take: limit,
      includeInactive: options.includeInactive,
    });

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Create a new user (admin operation)
   */
  async create(data: CreateUserData, createdByUserId: string): Promise<User> {
    // Check if email already exists
    const emailExists = await this.userRepository.emailExists(data.email, data.companyId);
    if (emailExists) {
      throw new ConflictException('Email already registered in this company');
    }

    // Verify role exists
    const role = await this.prisma.role.findUnique({
      where: { id: data.roleId },
    });

    if (!role) {
      throw new BadRequestException('Role not found');
    }

    // Hash password
    const passwordHash = await this.hashPassword(data.password);

    // Create user
    const user = await this.userRepository.create({
      email: data.email,
      passwordHash,
      name: data.name,
      roleId: data.roleId,
      companyId: data.companyId,
      phone: data.phone,
      warehouseId: data.warehouseId,
    });

    this.logger.log(`User created: ${user.email} by user ${createdByUserId}`);

    return user;
  }

  /**
   * Update a user
   */
  async update(
    id: string,
    companyId: string,
    data: UpdateUserData,
    updatedByUserId: string,
  ): Promise<User> {
    // Verify user exists in company
    await this.findById(id, companyId);

    // If changing role, verify it exists
    if (data.roleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: data.roleId },
      });

      if (!role) {
        throw new BadRequestException('Role not found');
      }
    }

    // Prevent deactivating the last admin
    if (data.isActive === false) {
      await this.preventLastAdminDeactivation(id, companyId);
    }

    // Prepare update data
    const updateData: UpdateUserData = { ...data };

    // Hash new password if provided
    if (data.password) {
      updateData.passwordHash = await this.hashPassword(data.password);
      delete updateData.password;
    }

    const user = await this.userRepository.update(id, updateData);

    this.logger.log(`User updated: ${user.email} by user ${updatedByUserId}`);

    return user;
  }

  /**
   * Soft delete a user
   */
  async delete(id: string, companyId: string, deletedByUserId: string): Promise<void> {
    // Verify user exists in company
    await this.findById(id, companyId);

    // Prevent deleting the last admin
    await this.preventLastAdminDeactivation(id, companyId);

    // Prevent self-deletion
    if (id === deletedByUserId) {
      throw new ForbiddenException('Cannot delete your own account');
    }

    await this.userRepository.softDelete(id);

    this.logger.log(`User deleted: ${id} by user ${deletedByUserId}`);
  }

  /**
   * Update user profile (self-update)
   */
  async updateProfile(
    userId: string,
    _companyId: string,
    data: {
      name?: string;
      phone?: string;
      avatar?: string;
    },
  ): Promise<User> {
    const user = await this.userRepository.update(userId, data);
    this.logger.log(`User profile updated: ${user.email}`);
    return user;
  }

  /**
   * Change password (self-update)
   */
  async changePassword(
    userId: string,
    companyId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);

    if (!user || user.companyId !== companyId) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash and update new password
    const passwordHash = await this.hashPassword(newPassword);
    await this.userRepository.update(userId, { passwordHash });

    this.logger.log(`Password changed for user: ${user.email}`);
  }

  /**
   * Get user statistics for a company
   */
  async getStatistics(companyId: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: { role: string; count: number }[];
  }> {
    const [total, active, inactive, byRole] = await Promise.all([
      this.prisma.user.count({
        where: { companyId, deletedAt: null },
      }),
      this.prisma.user.count({
        where: { companyId, deletedAt: null, isActive: true },
      }),
      this.prisma.user.count({
        where: { companyId, deletedAt: null, isActive: false },
      }),
      this.prisma.user.groupBy({
        by: ['roleId'],
        where: { companyId, deletedAt: null },
        _count: { id: true },
      }),
    ]);

    // Get role names
    const roleIds = byRole.map((r: { roleId: string }) => r.roleId);
    const roles = await this.prisma.role.findMany({
      where: { id: { in: roleIds } },
      select: { id: true, name: true },
    });

    const roleMap = new Map(roles.map((r: { id: string; name: string }) => [r.id, r.name]));

    return {
      total,
      active,
      inactive,
      byRole: byRole.map((r: { roleId: string; _count: { id: number } }) => ({
        role: roleMap.get(r.roleId) || 'Unknown',
        count: r._count.id,
      })),
    };
  }

  /**
   * Hash password
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Prevent deactivation/deletion of the last admin in a company
   */
  private async preventLastAdminDeactivation(userId: string, companyId: string): Promise<void> {
    // Check if user is an admin
    const user = await this.userRepository.findById(userId);

    if (!user || user.companyId !== companyId) {
      return;
    }

    // Find admin role
    const adminRole = await this.prisma.role.findFirst({
      where: { name: 'Admin' },
    });

    if (!adminRole || user.roleId !== adminRole.id) {
      return; // Not an admin, no restriction
    }

    // Count active admins
    const activeAdminCount = await this.prisma.user.count({
      where: {
        companyId,
        roleId: adminRole.id,
        isActive: true,
        deletedAt: null,
      },
    });

    if (activeAdminCount <= 1) {
      throw new ForbiddenException('Cannot deactivate or delete the last admin in the company');
    }
  }
}
