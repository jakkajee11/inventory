import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { InventoryRepositoryInterface } from '../domain/repositories/inventory.repository.interface';
import { StockMovement, MovementType, MovementStatus } from '../domain/entities/stock-movement.entity';

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
      status?: MovementStatus;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<{ movements: StockMovement[]; total: number }> {
    const where = {
      productId,
      companyId,
      ...(options?.type && { type: options.type }),
      ...(options?.status && { status: options.status }),
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
      where: { productId, warehouseId, companyId, status: MovementStatus.COMPLETED },
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
        balanceBefore: data.balanceBefore ?? 0,
        balanceAfter: data.balanceAfter!,
        unitCost: data.unitCost ?? 0,
        averageCostBefore: data.averageCostBefore ?? 0,
        averageCostAfter: data.averageCostAfter!,
        status: data.status ?? MovementStatus.PENDING,
        referenceType: data.referenceType,
        referenceId: data.referenceId,
        reason: data.reason,
        notes: data.notes,
        companyId: data.companyId!,
        createdBy: data.createdBy!,
      },
      include: { product: true },
    });
    return this.mapToEntity(movement);
  }

  async updateMovementStatus(
    id: string,
    status: MovementStatus,
    approvedBy?: string,
  ): Promise<StockMovement> {
    const movement = await this.prisma.stockMovement.update({
      where: { id },
      data: {
        status,
        ...(status === MovementStatus.COMPLETED && {
          approvedBy,
          approvedAt: new Date(),
        }),
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
        averageCost: product.averageCost,
        totalValue: product.currentStock * product.averageCost,
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
    entity.balanceBefore = movement.balanceBefore;
    entity.balanceAfter = movement.balanceAfter;
    entity.unitCost = movement.unitCost;
    entity.averageCostBefore = movement.averageCostBefore;
    entity.averageCostAfter = movement.averageCostAfter;
    entity.status = movement.status as MovementStatus;
    entity.referenceType = movement.referenceType;
    entity.referenceId = movement.referenceId;
    entity.reason = movement.reason;
    entity.notes = movement.notes;
    entity.companyId = movement.companyId;
    entity.createdBy = movement.createdBy;
    entity.approvedBy = movement.approvedBy;
    entity.approvedAt = movement.approvedAt;
    entity.createdAt = movement.createdAt;
    entity.product = movement.product;
    return entity;
  }
}
