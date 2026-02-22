import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserRepositoryInterface } from '../domain/repositories/user.repository.interface';
import { User } from '../domain/entities/user.entity';
import { Role, Permission } from '../domain/entities/role.entity';

// Type definition for user with role and permissions
interface UserWithRole {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  roleId: string;
  companyId: string;
  warehouseId: string | null;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  role: {
    id: string;
    name: string;
    description: string | null;
    isSystem: boolean;
    createdAt: Date;
    updatedAt: Date;
    permissions: {
      id: string;
      roleId: string;
      module: string;
      action: string;
      isGranted: boolean;
      createdAt: Date;
      updatedAt: Date;
    }[];
  } | null;
}

@Injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) return null;

    return this.mapToEntity(user);
  }

  async findByEmail(email: string, companyId: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        companyId,
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

    return this.mapToEntity(user);
  }

  async findByEmailWithRole(email: string, companyId: string): Promise<User | null> {
    return this.findByEmail(email, companyId);
  }

  async create(data: {
    email: string;
    passwordHash: string;
    name: string;
    roleId: string;
    companyId: string;
    phone?: string;
    warehouseId?: string;
  }): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name,
        roleId: data.roleId,
        companyId: data.companyId,
        phone: data.phone,
        warehouseId: data.warehouseId,
      },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    return this.mapToEntity(user);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.roleId !== undefined) updateData.roleId = data.roleId;
    if (data.warehouseId !== undefined) updateData.warehouseId = data.warehouseId;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.passwordHash !== undefined) updateData.passwordHash = data.passwordHash;

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    return this.mapToEntity(user);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }

  async findAllByCompanyId(
    companyId: string,
    options?: {
      skip?: number;
      take?: number;
      includeInactive?: boolean;
    },
  ): Promise<{ users: User[]; total: number }> {
    const where = {
      companyId,
      deletedAt: null,
      ...(options?.includeInactive ? {} : { isActive: true }),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: options?.skip,
        take: options?.take,
        include: {
          role: {
            include: {
              permissions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users: users.map((user: UserWithRole) => this.mapToEntity(user)),
      total,
    };
  }

  async emailExists(email: string, companyId: string, excludeId?: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: {
        email,
        companyId,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });

    return count > 0;
  }

  async findByIdWithPermissions(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) return null;

    return this.mapToEntity(user);
  }

  private mapToEntity(user: UserWithRole): User {
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
      const role = new Role();
      role.id = user.role.id;
      role.name = user.role.name;
      role.description = user.role.description ?? undefined;
      role.isSystem = user.role.isSystem;
      role.createdAt = user.role.createdAt;
      role.updatedAt = user.role.updatedAt;

      if (user.role.permissions) {
        role.permissions = user.role.permissions.map((p) => {
          const permission = new Permission();
          permission.id = p.id;
          permission.roleId = p.roleId;
          permission.module = p.module;
          permission.action = p.action;
          permission.isGranted = p.isGranted;
          permission.createdAt = p.createdAt;
          permission.updatedAt = p.updatedAt;
          return permission;
        });
      }

      entity.role = role;
      entity.permissions = role.permissions;
    }

    return entity;
  }
}
