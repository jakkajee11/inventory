export interface DashboardStats {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalValue: number;
}

export interface LowStockItem {
  productId: string;
  sku: string;
  productName: string;
  currentStock: number;
  minStock: number;
  categoryName: string | null;
}

export interface ActivityItem {
  id: string;
  type: 'receipt' | 'issue' | 'adjustment' | 'product';
  message: string;
  timestamp: string;
  user?: string;
  productName: string;
  quantity?: number;
  referenceNumber?: string;
}

export interface TrendDataPoint {
  date: string;
  receipts: number;
  issues: number;
  net: number;
}

export interface MovementSummary {
  receipts: number;
  issues: number;
  adjustments: number;
}
