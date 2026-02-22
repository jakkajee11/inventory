import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { InventoryRepositoryInterface } from '../domain/repositories/inventory.repository.interface';
import { StockMovement, MovementType } from '../domain/entities/stock-movement.entity';

@Injectable()
export class InventoryRepository implements InventoryRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async findMovementsByProduct(
    productId: string,
    companyId: string,
    options?: {
      skip?: number;
      take?: number;
      type?: MovementType;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<{ movements: StockMovement[]; total: number }> {
    const where = {
      productId,
      companyId,
      ...(options?.type && { type: options.type }),
      ...(options?.startDate && { createdAt: { gte: options.startDate } }),
      ...(options?.endDate && { createdAt: { lte: options.endDate } }),
    };

    const [movements, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        skip: options?.skip,
        take: options?.take,
        include: { product: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.stockMovement.count({ where }),
    ]);

    return {
      movements: movements.map((m) => this.mapToEntity(m)),
      total,
    };
  }

  async findLatestMovement(
    productId: string,
    warehouseId: string,
    companyId: string,
  ): Promise<StockMovement | null> {
    const movement = await this.prisma.stockMovement.findFirst({
      where: { productId, warehouseId, companyId },
      orderBy: { createdAt: 'desc' },
    });
    return movement ? this.mapToEntity(movement) : null;
  }

  async createMovement(data: Partial<StockMovement>): Promise<StockMovement> {
    const movement = await this.prisma.stockMovement.create({
      data: {
        productId: data.productId!,
        warehouseId: data.warehouseId!,
        type: data.type!,
        quantity: data.quantity!,
        balanceAfter: data.balanceAfter!,
        unitCost: data.unitCost ?? 0,
        averageCostAfter: data.averageCostAfter!,
        referenceType: data.referenceType!,
        referenceId: data.referenceId!,
        referenceNo: data.referenceNo!,
        notes: data.notes,
        companyId: data.companyId!,
        userId: data.userId!,
      },
      include: { product: true },
    });
    return this.mapToEntity(movement);
  }

  async getInventorySummary(
    companyId: string,
    options?: {
      warehouseId?: string;
      categoryId?: string;
      lowStockOnly?: boolean;
    },
  ): Promise<any[]> {
    const products = await this.prisma.product.findMany({
      where: {
        companyId,
        deletedAt: null,
        isActive: true,
        ...(options?.categoryId && { categoryId: options.categoryId }),
      },
      include: { category: true, unit: true },
    });

    return products.map((product) => {
      const isLowStock = product.currentStock <= product.minStock;
      if (options?.lowStockOnly && !isLowStock) {
        return null;
      }
      return {
        productId: product.id,
        productSku: product.sku,
        productName: product.name,
        currentStock: product.currentStock,
        averageCost: Number(product.averageCost),
        totalValue: product.currentStock * Number(product.averageCost),
        minStock: product.minStock,
        isLowStock,
        category: product.category,
        unit: product.unit,
      };
    }).filter(Boolean);
  }

  private mapToEntity(movement: any): StockMovement {
    const entity = new StockMovement();
    entity.id = movement.id;
    entity.productId = movement.productId;
    entity.warehouseId = movement.warehouseId;
    entity.type = movement.type as MovementType;
    entity.quantity = movement.quantity;
    entity.balanceAfter = movement.balanceAfter;
    entity.unitCost = movement.unitCost;
    entity.averageCostAfter = movement.averageCostAfter;
    entity.referenceType = movement.referenceType;
    entity.referenceId = movement.referenceId;
    entity.referenceNo = movement.referenceNo;
    entity.notes = movement.notes;
    entity.companyId = movement.companyId;
    entity.userId = movement.userId;
    entity.createdAt = movement.createdAt;
    entity.product = movement.product;
    return entity;
  }
}
