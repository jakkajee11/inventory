import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ProductRepositoryInterface } from '../domain/repositories/product.repository.interface';
import { Product } from '../domain/entities/product.entity';

@Injectable()
export class ProductRepository implements ProductRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, companyId: string): Promise<Product | null> {
    const product = await this.prisma.product.findFirst({
      where: { id, companyId, deletedAt: null },
      include: { category: true, unit: true },
    });
    return product ? this.mapToEntity(product) : null;
  }

  async findBySku(sku: string, companyId: string): Promise<Product | null> {
    const product = await this.prisma.product.findFirst({
      where: { sku, companyId, deletedAt: null },
      include: { category: true, unit: true },
    });
    return product ? this.mapToEntity(product) : null;
  }

  async findByBarcode(barcode: string, companyId: string): Promise<Product | null> {
    const product = await this.prisma.product.findFirst({
      where: { barcode, companyId, deletedAt: null },
      include: { category: true, unit: true },
    });
    return product ? this.mapToEntity(product) : null;
  }

  async findAll(companyId: string, options?: {
    skip?: number;
    take?: number;
    search?: string;
    categoryId?: string;
    includeInactive?: boolean;
  }): Promise<{ products: Product[]; total: number }> {
    const where = {
      companyId,
      deletedAt: null,
      ...(options?.includeInactive ? {} : { isActive: true }),
      ...(options?.categoryId ? { categoryId: options.categoryId } : {}),
      ...(options?.search ? {
        OR: [
          { sku: { contains: options.search, mode: 'insensitive' as const } },
          { name: { contains: options.search, mode: 'insensitive' as const } },
          { barcode: { contains: options.search, mode: 'insensitive' as const } },
        ],
      } : {}),
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: options?.skip,
        take: options?.take,
        include: { category: true, unit: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { products: products.map((p) => this.mapToEntity(p)), total };
  }

  async create(data: Partial<Product>): Promise<Product> {
    const product = await this.prisma.product.create({
      data: {
        sku: data.sku!,
        barcode: data.barcode,
        name: data.name!,
        description: data.description,
        categoryId: data.categoryId,
        unitId: data.unitId!,
        costPrice: data.costPrice || 0,
        sellingPrice: data.sellingPrice || 0,
        minStock: data.minStock || 0,
        maxStock: data.maxStock,
        images: data.images,
        companyId: data.companyId!,
        isActive: data.isActive ?? true,
      },
      include: { category: true, unit: true },
    });
    return this.mapToEntity(product);
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.barcode !== undefined && { barcode: data.barcode }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.unitId !== undefined && { unitId: data.unitId }),
        ...(data.costPrice !== undefined && { costPrice: data.costPrice }),
        ...(data.sellingPrice !== undefined && { sellingPrice: data.sellingPrice }),
        ...(data.minStock !== undefined && { minStock: data.minStock }),
        ...(data.maxStock !== undefined && { maxStock: data.maxStock }),
        ...(data.images !== undefined && { images: data.images }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        version: { increment: 1 },
      },
      include: { category: true, unit: true },
    });
    return this.mapToEntity(product);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async skuExists(sku: string, companyId: string, excludeId?: string): Promise<boolean> {
    const count = await this.prisma.product.count({
      where: {
        sku,
        companyId,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
    return count > 0;
  }

  async barcodeExists(barcode: string, companyId: string, excludeId?: string): Promise<boolean> {
    if (!barcode) return false;
    const count = await this.prisma.product.count({
      where: {
        barcode,
        companyId,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
    return count > 0;
  }

  private mapToEntity(product: any): Product {
    const entity = new Product();
    entity.id = product.id;
    entity.sku = product.sku;
    entity.barcode = product.barcode;
    entity.name = product.name;
    entity.description = product.description;
    entity.categoryId = product.categoryId;
    entity.unitId = product.unitId;
    entity.costPrice = product.costPrice;
    entity.sellingPrice = product.sellingPrice;
    entity.minStock = product.minStock;
    entity.maxStock = product.maxStock;
    entity.currentStock = product.currentStock;
    entity.averageCost = product.averageCost;
    entity.images = product.images;
    entity.isActive = product.isActive;
    entity.version = product.version;
    entity.companyId = product.companyId;
    entity.createdAt = product.createdAt;
    entity.updatedAt = product.updatedAt;
    entity.deletedAt = product.deletedAt;
    entity.category = product.category;
    entity.unit = product.unit;
    return entity;
  }
}
