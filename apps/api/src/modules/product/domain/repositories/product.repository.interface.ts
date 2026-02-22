import { Product } from '../entities/product.entity';

export interface ProductRepositoryInterface {
  findById(id: string, companyId: string): Promise<Product | null>;
  findBySku(sku: string, companyId: string): Promise<Product | null>;
  findByBarcode(barcode: string, companyId: string): Promise<Product | null>;
  findAll(companyId: string, options?: {
    skip?: number;
    take?: number;
    search?: string;
    categoryId?: string;
    includeInactive?: boolean;
  }): Promise<{ products: Product[]; total: number }>;
  create(data: Partial<Product>): Promise<Product>;
  update(id: string, data: Partial<Product>): Promise<Product>;
  softDelete(id: string): Promise<void>;
  skuExists(sku: string, companyId: string, excludeId?: string): Promise<boolean>;
  barcodeExists(barcode: string, companyId: string, excludeId?: string): Promise<boolean>;
}
