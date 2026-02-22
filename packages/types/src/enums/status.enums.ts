/**
 * Status and type enumeration definitions
 */

/**
 * Document status for inventory transactions
 */
export enum DocumentStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

/**
 * Stock movement type
 */
export enum MovementType {
  GOODS_RECEIPT = 'goods_receipt',       // Receiving goods from supplier
  GOODS_ISSUE = 'goods_issue',           // Issuing goods to customer
  ADJUSTMENT_IN = 'adjustment_in',       // Positive stock adjustment
  ADJUSTMENT_OUT = 'adjustment_out',     // Negative stock adjustment
  TRANSFER_IN = 'transfer_in',           // Receiving from another warehouse
  TRANSFER_OUT = 'transfer_out',         // Sending to another warehouse
  PRODUCTION_IN = 'production_in',       // Finished goods from production
  PRODUCTION_OUT = 'production_out',     // Raw materials for production
  RETURN_IN = 'return_in',               // Customer return
  RETURN_OUT = 'return_out',             // Return to supplier
}

/**
 * User status
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
}

/**
 * Company/tenant status
 */
export enum CompanyStatus {
  TRIAL = 'trial',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled',
}

/**
 * Subscription plan
 */
export enum SubscriptionPlan {
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

/**
 * Approval status for documents
 */
export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

/**
 * Product status
 */
export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONTINUED = 'discontinued',
}

/**
 * Stock valuation method
 */
export enum ValuationMethod {
  FIFO = 'fifo',                    // First In, First Out
  LIFO = 'lifo',                    // Last In, First Out
  WEIGHTED_AVERAGE = 'weighted_average', // Weighted Average Cost
  STANDARD = 'standard',            // Standard Cost
}

/**
 * Adjustment reason codes
 */
export enum AdjustmentReason {
  STOCK_COUNT = 'stock_count',
  DAMAGE = 'damage',
  EXPIRY = 'expiry',
  THEFT = 'theft',
  SAMPLE = 'sample',
  PROMOTION = 'promotion',
  INTERNAL_USE = 'internal_use',
  DATA_CORRECTION = 'data_correction',
  OTHER = 'other',
}

/**
 * Document type for numbering
 */
export enum DocumentType {
  GOODS_RECEIPT = 'GR',
  GOODS_ISSUE = 'GI',
  STOCK_ADJUSTMENT = 'SA',
  STOCK_TRANSFER = 'ST',
  PURCHASE_ORDER = 'PO',
  SALES_ORDER = 'SO',
}

/**
 * Notification type
 */
export enum NotificationType {
  LOW_STOCK = 'low_stock',
  STOCK_OUT = 'stock_out',
  EXPIRING_SOON = 'expiring_soon',
  APPROVAL_REQUIRED = 'approval_required',
  APPROVAL_APPROVED = 'approval_approved',
  APPROVAL_REJECTED = 'approval_rejected',
  SYSTEM = 'system',
}

/**
 * Audit action type
 */
export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
  LOGIN = 'login',
  LOGOUT = 'logout',
  EXPORT = 'export',
  IMPORT = 'import',
}

/**
 * Helper to check if movement type increases stock
 */
export function isInboundMovement(type: MovementType): boolean {
  return [
    MovementType.GOODS_RECEIPT,
    MovementType.ADJUSTMENT_IN,
    MovementType.TRANSFER_IN,
    MovementType.PRODUCTION_IN,
    MovementType.RETURN_IN,
  ].includes(type);
}

/**
 * Helper to check if movement type decreases stock
 */
export function isOutboundMovement(type: MovementType): boolean {
  return [
    MovementType.GOODS_ISSUE,
    MovementType.ADJUSTMENT_OUT,
    MovementType.TRANSFER_OUT,
    MovementType.PRODUCTION_OUT,
    MovementType.RETURN_OUT,
  ].includes(type);
}

/**
 * Helper to check if document is editable
 */
export function isDocumentEditable(status: DocumentStatus): boolean {
  return [DocumentStatus.DRAFT, DocumentStatus.PENDING].includes(status);
}

/**
 * Helper to check if document is final
 */
export function isDocumentFinal(status: DocumentStatus): boolean {
  return [DocumentStatus.APPROVED, DocumentStatus.CANCELLED, DocumentStatus.COMPLETED].includes(status);
}
