import { StockMovement, MovementType, MovementStatus } from '../entities/stock-movement.entity';

export interface InventoryRepositoryInterface {
  findMovementsByProduct(
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
  ): Promise<{ movements: StockMovement[]; total: number }>;

  findLatestMovement(
    productId: string,
    warehouseId: string,
    companyId: string,
  ): Promise<StockMovement | null>;

  createMovement(data: Partial<StockMovement>): Promise<StockMovement>;

  updateMovementStatus(
    id: string,
    status: MovementStatus,
    approvedBy?: string,
  ): Promise<StockMovement>;

  getInventorySummary(
    companyId: string,
    options?: {
      warehouseId?: string;
      categoryId?: string;
      lowStockOnly?: boolean;
    },
  ): Promise<{
    productId: string;
    productSku: string;
    productName: string;
    currentStock: number;
    averageCost: number;
    totalValue: number;
    minStock: number;
    isLowStock: boolean;
  }[]>;
}
