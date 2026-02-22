import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { StockAdjustmentRepository } from './infrastructure/stock-adjustment.repository';
import { StockAdjustment, AdjustmentStatus } from './domain/entities/stock-adjustment.entity';
import { CreateStockAdjustmentDto, StockAdjustmentQueryDto } from './application/dtos/stock-adjustment.dto';

@Injectable()
export class StockAdjustmentService {
  constructor(private readonly adjustmentRepository: StockAdjustmentRepository) {}

  async create(companyId: string, userId: string, dto: CreateStockAdjustmentDto): Promise<StockAdjustment> {
    const adjustmentNumber = await this.adjustmentRepository.generateAdjustmentNumber(companyId);

    // For each item, we would fetch current stock and calculate adjustment
    // This would integrate with ProductService

    const items = dto.items.map((item) => ({
      productId: item.productId,
      quantityBefore: 0, // Would be fetched from current stock
      quantityAfter: item.quantityAfter,
      adjustment: item.quantityAfter - 0, // quantityAfter - quantityBefore
      unitCost: 0, // Would be fetched from product's average cost
      valueChange: 0, // adjustment * unitCost
      reason: item.reason,
    }));

    const totalValueChange = items.reduce((sum, item) => sum + item.valueChange, 0);

    return this.adjustmentRepository.create({
      adjustmentNumber,
      adjustmentType: dto.adjustmentType,
      warehouseId: dto.warehouseId,
      notes: dto.notes,
      totalValueChange,
      status: AdjustmentStatus.DRAFT,
      companyId,
      createdById: userId,
    }, items);
  }

  async findById(id: string, companyId: string): Promise<StockAdjustment> {
    const adjustment = await this.adjustmentRepository.findById(id, companyId);
    if (!adjustment) {
      throw new NotFoundException('Stock adjustment not found');
    }
    return adjustment;
  }

  async findAll(companyId: string, query: StockAdjustmentQueryDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const { adjustments, total } = await this.adjustmentRepository.findAll(companyId, {
      skip,
      take: limit,
      status: query.status,
      adjustmentType: query.adjustmentType,
    });

    return {
      adjustments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async submit(id: string, companyId: string, userId: string): Promise<StockAdjustment> {
    const adjustment = await this.findById(id, companyId);

    if (adjustment.status !== AdjustmentStatus.DRAFT) {
      throw new BadRequestException('Can only submit draft adjustments');
    }

    if (adjustment.items.length === 0) {
      throw new BadRequestException('Cannot submit adjustment without items');
    }

    return this.adjustmentRepository.update(id, {
      status: AdjustmentStatus.PENDING,
    });
  }

  async approve(id: string, companyId: string, userId: string): Promise<StockAdjustment> {
    const adjustment = await this.findById(id, companyId);

    if (adjustment.status !== AdjustmentStatus.PENDING) {
      throw new BadRequestException('Can only approve pending adjustments');
    }

    // Stock updates would be handled here by integrating with InventoryService

    return this.adjustmentRepository.update(id, {
      status: AdjustmentStatus.APPROVED,
      approvedById: userId,
      approvedAt: new Date(),
    });
  }

  async cancel(id: string, companyId: string, userId: string, reason: string): Promise<StockAdjustment> {
    const adjustment = await this.findById(id, companyId);

    if (adjustment.status === AdjustmentStatus.CANCELLED) {
      throw new BadRequestException('Adjustment is already cancelled');
    }

    if (adjustment.status === AdjustmentStatus.APPROVED) {
      throw new BadRequestException('Cannot cancel approved adjustments');
    }

    return this.adjustmentRepository.update(id, {
      status: AdjustmentStatus.CANCELLED,
      cancelledById: userId,
      cancelledAt: new Date(),
      cancellationReason: reason,
    });
  }

  async delete(id: string, companyId: string): Promise<void> {
    const adjustment = await this.findById(id, companyId);

    if (adjustment.status !== AdjustmentStatus.DRAFT) {
      throw new BadRequestException('Can only delete draft adjustments');
    }

    await this.adjustmentRepository.update(id, { status: AdjustmentStatus.CANCELLED });
  }
}
