export interface Product {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  categoryId?: string;
  unitId: string;
  costPrice: number;
  sellingPrice: number;
  minStock: number;
  maxStock?: number;
  currentStock: number;
  averageCost: number;
  imageUrl?: string;
  isActive: boolean;
  version: number;
  category?: Category;
  unit?: Unit;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
}

export interface Unit {
  id: string;
  name: string;
  abbreviation: string;
  baseUnitId?: string;
  conversionFactor: number;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  includeInactive?: boolean;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateProductData {
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  categoryId?: string;
  unitId: string;
  costPrice?: number;
  sellingPrice?: number;
  minStock?: number;
  maxStock?: number;
  imageUrl?: string;
  isActive?: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  version: number;
}
