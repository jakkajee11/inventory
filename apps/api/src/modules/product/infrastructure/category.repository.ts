import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface CategoryData {
  id: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  sortOrder: number;
  isActive: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  parent?: CategoryData | null;
  children?: CategoryData[];
}

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, companyId: string): Promise<CategoryData | null> {
    const category = await this.prisma.category.findFirst({
      where: { id, companyId, deletedAt: null },
      include: { parent: true, children: true },
    });
    return category ? this.mapToData(category) : null;
  }

  async findByName(name: string, companyId: string, excludeId?: string): Promise<CategoryData | null> {
    const category = await this.prisma.category.findFirst({
      where: {
        name,
        companyId,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
    return category ? this.mapToData(category) : null;
  }

  async findAll(companyId: string, options?: {
    skip?: number;
    take?: number;
    search?: string;
    includeInactive?: boolean;
  }): Promise<{ categories: CategoryData[]; total: number }> {
    const where = {
      companyId,
      deletedAt: null,
      ...(options?.includeInactive ? {} : { isActive: true }),
      ...(options?.search ? {
        OR: [
          { name: { contains: options.search, mode: 'insensitive' as const } },
          { description: { contains: options.search, mode: 'insensitive' as const } },
        ],
      } : {}),
    };

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip: options?.skip,
        take: options?.take,
        include: { parent: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.category.count({ where }),
    ]);

    return { categories: categories.map((c) => this.mapToData(c)), total };
  }

  async findAllForTree(companyId: string, includeInactive = false): Promise<CategoryData[]> {
    const categories = await this.prisma.category.findMany({
      where: {
        companyId,
        deletedAt: null,
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    return categories.map((c) => this.mapToData(c));
  }

  async create(data: Partial<CategoryData>): Promise<CategoryData> {
    const category = await this.prisma.category.create({
      data: {
        name: data.name!,
        description: data.description,
        parentId: data.parentId,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
        companyId: data.companyId!,
      },
      include: { parent: true, children: true },
    });
    return this.mapToData(category);
  }

  async update(id: string, data: Partial<CategoryData>): Promise<CategoryData> {
    const category = await this.prisma.category.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.parentId !== undefined && { parentId: data.parentId }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: { parent: true, children: true },
    });
    return this.mapToData(category);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async hasProducts(id: string): Promise<boolean> {
    const count = await this.prisma.product.count({
      where: { categoryId: id, deletedAt: null },
    });
    return count > 0;
  }

  async hasChildren(id: string): Promise<boolean> {
    const count = await this.prisma.category.count({
      where: { parentId: id, deletedAt: null },
    });
    return count > 0;
  }

  private mapToData(category: any): CategoryData {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      parentId: category.parentId,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      companyId: category.companyId,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      deletedAt: category.deletedAt,
      parent: category.parent ? this.mapToData(category.parent) : null,
      children: category.children?.map((c: any) => this.mapToData(c)) ?? [],
    };
  }
}
