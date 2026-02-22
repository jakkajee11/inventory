import { StockMovement, MovementType } from '../entities/stock-movement.entity';

export interface InventoryRepositoryInterface {
  findMovementsByProduct(
    productId: string,
    companyId: string,
    options?: {
      skip?: number;
      take?: number;
      type?: MovementType;
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
