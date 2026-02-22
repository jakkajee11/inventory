export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: 'RECEIPT' | 'ISSUE' | 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT' | 'TRANSFER_IN' | 'TRANSFER_OUT';
  quantity: number;
  balanceAfter: number;
  unitCost: number;
  referenceType: string;
  referenceId: string;
  notes?: string;
  createdAt: string;
}

export interface InventoryItem {
  productId: string;
  sku: string;
  productName: string;
  categoryName: string | null;
  unitName: string;
  currentStock: number;
  minStock: number;
  maxStock: number | null;
  averageCost: number;
  totalValue: number;
}

export interface InventoryFilters {
  search?: string;
  categoryId?: string;
  stockStatus?: 'all' | 'low' | 'out' | 'normal';
  page?: number;
  limit?: number;
}

export interface InventoryListResponse {
  items: InventoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MovementHistoryResponse {
  items: StockMovement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
