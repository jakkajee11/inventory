export type ReceiptStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'CANCELLED';

export interface GoodsReceiptItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  notes?: string;
}

export interface GoodsReceipt {
  id: string;
  receiptNumber: string;
  supplierName: string;
  warehouseId: string;
  warehouseName?: string;
  status: ReceiptStatus;
  notes?: string;
  items: GoodsReceiptItem[];
  totalAmount: number;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReceiptItemDto {
  productId: string;
  quantity: number;
  unitCost: number;
  notes?: string;
}

export interface CreateReceiptDto {
  supplierName: string;
  warehouseId: string;
  notes?: string;
  items: CreateReceiptItemDto[];
}

export interface ReceiptListResponse {
  receipts: GoodsReceipt[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
