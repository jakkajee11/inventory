/**
 * Product-related type definitions
 */

/**
 * Unit of measurement for products
 */
export interface Unit {
  id: string;
  code: string;
  name: string;
  nameTh: string;
  description?: string;
  isBaseUnit: boolean;
  baseUnitId?: string;
  conversionFactor: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Product category for organization
 */
export interface Category {
  id: string;
  code: string;
  name: string;
  nameTh: string;
  description?: string;
  parentId?: string;
  companyId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Product entity
 */
export interface Product {
  id: string;
  code: string;
  sku: string;
  name: string;
  nameTh?: string;
  description?: string;
  categoryId: string;
  companyId: string;
  baseUnitId: string;
  
  // Pricing
  costPrice: number;
  sellingPrice: number;
  
  // Inventory
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  currentStock: number;
  averageCost: number;
  
  // Status
  isActive: boolean;
  isStockable: boolean;
  isSellable: boolean;
  
  // Additional info
  barcode?: string;
  weight?: number;
  weightUnit?: string;
  imageUrl?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Product creation DTO
 */
export interface CreateProductDto {
  code: string;
  sku: string;
  name: string;
  nameTh?: string;
  description?: string;
  categoryId: string;
  baseUnitId: string;
  costPrice: number;
  sellingPrice: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderPoint?: number;
  barcode?: string;
  weight?: number;
  weightUnit?: string;
  imageUrl?: string;
  isStockable?: boolean;
  isSellable?: boolean;
}

/**
 * Product update DTO
 */
export interface UpdateProductDto {
  name?: string;
  nameTh?: string;
  description?: string;
  categoryId?: string;
  costPrice?: number;
  sellingPrice?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderPoint?: number;
  barcode?: string;
  weight?: number;
  weightUnit?: string;
  imageUrl?: string;
  isActive?: boolean;
  isStockable?: boolean;
  isSellable?: boolean;
}

/**
 * Product with category and unit details
 */
export interface ProductWithDetails extends Product {
  category: Category;
  baseUnit: Unit;
}

/**
 * Product search/filter options
 */
export interface ProductFilterOptions {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  isStockable?: boolean;
  isSellable?: boolean;
  lowStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
}
