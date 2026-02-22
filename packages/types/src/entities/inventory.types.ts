/**
 * Inventory-related type definitions
 */

import { DocumentStatus, MovementType } from '../enums/status.enums';
import { Product } from './product.types';
import { Warehouse } from './company.types';

/**
 * Stock balance for a product in a warehouse
 */
export interface StockBalance {
  id: string;
  productId: string;
  warehouseId: string;
  companyId: string;
  
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  averageCost: number;
  totalValue: number;
  
  lastMovementAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Stock balance with product details
 */
export interface StockBalanceWithDetails extends StockBalance {
  product: Product;
  warehouse: Warehouse;
}

/**
 * Stock movement line item
 */
export interface StockMovementLine {
  id: string;
  movementId: string;
  productId: string;
  
  quantity: number;
  unitCost: number;
  totalCost: number;
  
  // Batch/serial tracking
  batchNumber?: string;
  serialNumber?: string;
  expiryDate?: Date;
  
  // Reference
  locationFrom?: string;
  locationTo?: string;
  
  notes?: string;
  
  createdAt: Date;
}

/**
 * Stock movement header
 */
export interface StockMovement {
  id: string;
  documentNumber: string;
  companyId: string;
  warehouseId: string;
  
  movementType: MovementType;
  status: DocumentStatus;
  
  // Dates
  movementDate: Date;
  documentDate: Date;
  
  // Reference
  referenceType?: string;
  referenceId?: string;
  referenceNumber?: string;
  
  // Party info (for receipts/issues)
  partnerId?: string;
  partnerName?: string;
  
  // Totals
  totalQuantity: number;
  totalValue: number;
  
  // Approval
  approvedBy?: string;
  approvedAt?: Date;
  
  // Additional info
  remarks?: string;
  internalNotes?: string;
  
  // Timestamps
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
}

/**
 * Stock movement with lines and details
 */
export interface StockMovementWithDetails extends StockMovement {
  lines: StockMovementLine[];
  warehouse: Warehouse;
}

/**
 * Goods receipt (receiving)
 */
export interface GoodsReceipt extends StockMovement {
  movementType: MovementType.GOODS_RECEIPT;
  purchaseOrderId?: string;
  purchaseOrderNumber?: string;
  supplierId: string;
  supplierName: string;
  invoiceNumber?: string;
  deliveryNoteNumber?: string;
}

/**
 * Goods issue (dispatch)
 */
export interface GoodsIssue extends StockMovement {
  movementType: MovementType.GOODS_ISSUE;
  salesOrderId?: string;
  salesOrderNumber?: string;
  customerId: string;
  customerName: string;
  deliveryNoteNumber?: string;
}

/**
 * Stock adjustment
 */
export interface StockAdjustment extends StockMovement {
  movementType: MovementType.ADJUSTMENT_IN | MovementType.ADJUSTMENT_OUT;
  adjustmentReason: string;
}

/**
 * Stock transfer between warehouses
 */
export interface StockTransfer extends StockMovement {
  movementType: MovementType.TRANSFER_IN | MovementType.TRANSFER_OUT;
  sourceWarehouseId?: string;
  sourceWarehouseName?: string;
  destinationWarehouseId?: string;
  destinationWarehouseName?: string;
  transferId: string; // Links transfer_in and transfer_out
}

/**
 * Create stock movement line DTO
 */
export interface CreateStockMovementLineDto {
  productId: string;
  quantity: number;
  unitCost: number;
  batchNumber?: string;
  serialNumber?: string;
  expiryDate?: Date;
  locationFrom?: string;
  locationTo?: string;
  notes?: string;
}

/**
 * Create goods receipt DTO
 */
export interface CreateGoodsReceiptDto {
  warehouseId: string;
  movementDate: Date;
  supplierId: string;
  purchaseOrderId?: string;
  invoiceNumber?: string;
  deliveryNoteNumber?: string;
  lines: CreateStockMovementLineDto[];
  remarks?: string;
}

/**
 * Create goods issue DTO
 */
export interface CreateGoodsIssueDto {
  warehouseId: string;
  movementDate: Date;
  customerId: string;
  salesOrderId?: string;
  deliveryNoteNumber?: string;
  lines: CreateStockMovementLineDto[];
  remarks?: string;
}

/**
 * Create stock adjustment DTO
 */
export interface CreateStockAdjustmentDto {
  warehouseId: string;
  movementDate: Date;
  adjustmentReason: string;
  lines: CreateStockMovementLineDto[];
  remarks?: string;
}

/**
 * Stock movement filter options
 */
export interface StockMovementFilterOptions {
  warehouseId?: string;
  movementType?: MovementType;
  status?: DocumentStatus;
  dateFrom?: Date;
  dateTo?: Date;
  productId?: string;
  partnerId?: string;
  documentNumber?: string;
}

/**
 * Stock valuation report item
 */
export interface StockValuationItem {
  productId: string;
  productCode: string;
  productName: string;
  category: string;
  quantity: number;
  unitCost: number;
  totalValue: number;
  lastMovementDate?: Date;
}

/**
 * Stock valuation report
 */
export interface StockValuationReport {
  companyId: string;
  warehouseId?: string;
  asOfDate: Date;
  items: StockValuationItem[];
  totalQuantity: number;
  totalValue: number;
  generatedAt: Date;
}

/**
 * Low stock alert
 */
export interface LowStockAlert {
  productId: string;
  productCode: string;
  productName: string;
  currentStock: number;
  reorderPoint: number;
  shortageQuantity: number;
  warehouseId?: string;
  warehouseName?: string;
}
