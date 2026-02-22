import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { StockAdjustment, StockAdjustmentItem, AdjustmentStatus, AdjustmentType } from '../domain/entities/stock-adjustment.entity';

@Injectable()
export class StockAdjustmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, companyId: string): Promise<StockAdjustment | null> {
    const adjustment = await this.prisma.stockAdjustment.findFirst({
      where: { id, companyId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
    return adjustment ? this.mapToEntity(adjustment) : null;
  }

  async findAll(companyId: string, options?: {
    skip?: number;
    take?: number;
    status?: AdjustmentStatus;
    adjustmentType?: AdjustmentType;
  }): Promise<{ adjustments: StockAdjustment[]; total: number }> {
    const where = {
      companyId,
      ...(options?.status && { status: options.status }),
      ...(options?.adjustmentType && { adjustmentType: options.adjustmentType }),
    };

    const [adjustments, total] = await Promise.all([
      this.prisma.stockAdjustment.findMany({
        where,
        skip: options?.skip,
        take: options?.take,
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.stockAdjustment.count({ where }),
    ]);

    return {
      adjustments: adjustments.map((a) => this.mapToEntity(a)),
      total,
    };
  }

  async create(data: Partial<StockAdjustment>, items: Partial<StockAdjustmentItem>[]): Promise<StockAdjustment> {
    const adjustment = await this.prisma.stockAdjustment.create({
      data: {
        adjustmentNumber: data.adjustmentNumber!,
        adjustmentType: data.adjustmentType!,
        warehouseId: data.warehouseId,
        status: data.status ?? AdjustmentStatus.DRAFT,
        notes: data.notes,
        totalValueChange: data.totalValueChange ?? 0,
        companyId: data.companyId!,
        createdById: data.createdById!,
        items: {
          create: items.map((item) => ({
            productId: item.productId!,
            quantityBefore: item.quantityBefore!,
            quantityAfter: item.quantityAfter!,
            adjustment: item.adjustment!,
            unitCost: item.unitCost ?? 0,
            valueChange: item.valueChange ?? 0,
            reason: item.reason,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });
    return this.mapToEntity(adjustment);
  }

  async update(id: string, data: Partial<StockAdjustment>): Promise<StockAdjustment> {
    const adjustment = await this.prisma.stockAdjustment.update({
      where: { id },
      data: {
        ...(data.status !== undefined && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.totalValueChange !== undefined && { totalValueChange: data.totalValueChange }),
        ...(data.approvedById !== undefined && { approvedById: data.approvedById }),
        ...(data.approvedAt !== undefined && { approvedAt: data.approvedAt }),
        ...(data.cancelledById !== undefined && { cancelledById: data.cancelledById }),
        ...(data.cancelledAt !== undefined && { cancelledAt: data.cancelledAt }),
        ...(data.cancellationReason !== undefined && { cancellationReason: data.cancellationReason }),
      },
      include: { items: { include: { product: true } } },
    });
    return this.mapToEntity(adjustment);
  }

  async generateAdjustmentNumber(companyId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `ADJ-${year}-`;

    const lastAdjustment = await this.prisma.stockAdjustment.findFirst({
      where: {
        companyId,
        adjustmentNumber: { startsWith: prefix },
      },
      orderBy: { adjustmentNumber: 'desc' },
    });

    if (!lastAdjustment) {
      return `${prefix}00001`;
    }

    const lastNumber = parseInt(lastAdjustment.adjustmentNumber.split('-')[2], 10);
    return `${prefix}${String(lastNumber + 1).padStart(5, '0')}`;
  }

  private mapToEntity(adjustment: any): StockAdjustment {
    const entity = new StockAdjustment();
    entity.id = adjustment.id;
    entity.adjustmentNumber = adjustment.adjustmentNumber;
    entity.adjustmentType = adjustment.adjustmentType as AdjustmentType;
    entity.warehouseId = adjustment.warehouseId;
    entity.status = adjustment.status as AdjustmentStatus;
    entity.notes = adjustment.notes;
    entity.totalValueChange = adjustment.totalValueChange;
    entity.companyId = adjustment.companyId;
    entity.createdById = adjustment.createdById;
    entity.approvedById = adjustment.approvedById;
    entity.approvedAt = adjustment.approvedAt;
    entity.cancelledById = adjustment.cancelledById;
    entity.cancelledAt = adjustment.cancelledAt;
    entity.cancellationReason = adjustment.cancellationReason;
    entity.createdAt = adjustment.createdAt;
    entity.updatedAt = adjustment.updatedAt;
    entity.items = adjustment.items?.map((item: any) => {
      const itemEntity = new StockAdjustmentItem();
      itemEntity.id = item.id;
      itemEntity.adjustmentId = item.adjustmentId;
      itemEntity.productId = item.productId;
      itemEntity.quantityBefore = item.quantityBefore;
      itemEntity.quantityAfter = item.quantityAfter;
      itemEntity.adjustment = item.adjustment;
      itemEntity.unitCost = item.unitCost;
      itemEntity.valueChange = item.valueChange;
      itemEntity.reason = item.reason;
      itemEntity.product = item.product;
      return itemEntity;
    }) || [];
    return entity;
  }
}
