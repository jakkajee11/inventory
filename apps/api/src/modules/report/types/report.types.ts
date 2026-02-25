export type ReportType = 'STOCK' | 'MOVEMENT';
export type ExportFormat = 'PDF' | 'EXCEL' | 'CSV';

export interface StockReportItem {
  productId: string;
  sku: string;
  productName: string;
  categoryName: string | null;
  unitName: string;
  currentStock: number;
  minStock: number;
  averageCost: number;
  totalValue: number;
  stockStatus: 'LOW' | 'NORMAL' | 'HIGH';
}

export interface StockReportResponse {
  asOfDate: string;
  generatedAt: string;
  items: StockReportItem[];
  summary: {
    totalProducts: number;
    totalValue: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MovementReportItem {
  id: string;
  movementDate: string;
  productName: string;
  sku: string;
  movementType: string;
  quantity: number;
  balanceAfter: number;
  referenceType: string;
  referenceNumber: string;
  unitCost: number;
  totalValue: number;
}

export interface MovementReportResponse {
  startDate: string;
  endDate: string;
  generatedAt: string;
  items: MovementReportItem[];
  summary: {
    totalMovements: number;
    totalIn: number;
    totalOut: number;
    netChange: number;
    totalValue: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}