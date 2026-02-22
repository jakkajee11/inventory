export type AdjustmentStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'CANCELLED';
export type AdjustmentType = 'INVENTORY_COUNT' | 'DAMAGE' | 'THEFT' | 'EXPIRATION' | 'OTHER';

export interface StockAdjustmentItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantityBefore: number;
  quantityAfter: number;
  difference: number;
  reason?: string;
}

export interface StockAdjustment {
  id: string;
  adjustmentNumber: string;
  adjustmentType: AdjustmentType;
  warehouseId: string;
  status: AdjustmentStatus;
  notes?: string;
  items: StockAdjustmentItem[];
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdjustmentItemDto {
  productId: string;
  quantityAfter: number;
  reason?: string;
}

export interface CreateAdjustmentDto {
  adjustmentType: AdjustmentType;
  warehouseId: string;
  notes?: string;
  items: CreateAdjustmentItemDto[];
}

export interface AdjustmentListResponse {
  adjustments: StockAdjustment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
