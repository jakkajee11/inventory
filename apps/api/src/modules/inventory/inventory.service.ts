import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InventoryRepository } from './infrastructure/inventory.repository';
import { StockCalculatorService } from './stock-calculator.service';
import { StockMovement, MovementType, MovementStatus } from './domain/entities/stock-movement.entity';

export interface InventoryQuery {
  page?: number;
  limit?: number;
  warehouseId?: string;
  categoryId?: string;
  lowStockOnly?: boolean;
}

export interface MovementQuery {
  page?: number;
  limit?: number;
  type?: MovementType;
  status?: MovementStatus;
  startDate?: Date;
  endDate?: Date;
}

@Injectable()
export class InventoryService {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly stockCalculator: StockCalculatorService,
  ) {}

  async getInventorySummary(companyId: string, query: InventoryQuery) {
    const summary = await this.inventoryRepository.getInventorySummary(companyId, {
      warehouseId: query.warehouseId,
      categoryId: query.categoryId,
      lowStockOnly: query.lowStockOnly,
    });

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;
    const total = summary.length;
    const paginatedSummary = summary.slice(skip, skip + limit);

    return {
      items: paginatedSummary,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProductMovements(
    productId: string,
    companyId: string,
    query: MovementQuery,
  ) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const { movements, total } = await this.inventoryRepository.findMovementsByProduct(
      productId,
      companyId,
      {
        skip,
        take: limit,
        type: query.type,
        status: query.status,
        startDate: query.startDate,
        endDate: query.endDate,
      },
    );

    return {
      movements,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createStockMovement(
    data: Partial<StockMovement>,
    currentStock: number,
    currentAverageCost: number,
  ): Promise<StockMovement> {
    let balanceAfter: number;
    let averageCostAfter: number;

    if ([MovementType.RECEIPT, MovementType.ADJUSTMENT_IN, MovementType.TRANSFER_IN].includes(data.type!)) {
      const result = this.stockCalculator.calculateWeightedAverage({
        currentStock,
        currentAverageCost,
        incomingQuantity: data.quantity!,
        incomingUnitCost: data.unitCost || 0,
      });
      balanceAfter = result.newStock;
      averageCostAfter = result.newAverageCost;
    } else {
      const validation = this.stockCalculator.validateStockForIssue(
        currentStock,
        data.quantity!,
      );
      if (!validation.valid) {
        throw new BadRequestException(validation.error);
      }
      const result = this.stockCalculator.calculateStockAfterIssue(
        currentStock,
        data.quantity!,
        currentAverageCost,
      );
      balanceAfter = result.newStock;
      averageCostAfter = result.newAverageCost;
    }

    return this.inventoryRepository.createMovement({
      ...data,
      balanceBefore: currentStock,
      balanceAfter,
      averageCostBefore: currentAverageCost,
      averageCostAfter,
    });
  }
}
