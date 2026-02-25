import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductRepository } from './infrastructure/product.repository';

export interface ProductImportRow {
  sku: string;
  name: string;
  barcode?: string;
  description?: string;
  categoryId?: string;
  unitId: string;
  costPrice: number;
  sellingPrice: number;
  minStock?: number;
  maxStock?: number;
  isActive?: boolean;
}

export interface ImportError {
  row: number;
  sku?: string;
  field: string;
  message: string;
}

export interface ImportResult {
  successCount: number;
  errorCount: number;
  errors: ImportError[];
  totalRows: number;
}

@Injectable()
export class ProductImportService {
  private readonly logger = new Logger(ProductImportService.name);
  private readonly MAX_ROWS = 1000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly productRepository: ProductRepository,
  ) {}

  async importFromBuffer(
    buffer: Buffer,
    companyId: string,
    fileType: 'xlsx' | 'csv',
  ): Promise<ImportResult> {
    let rows: ProductImportRow[];

    if (fileType === 'csv') {
      rows = await this.parseCSV(buffer);
    } else {
      rows = await this.parseExcel(buffer);
    }

    if (rows.length === 0) {
      throw new BadRequestException('No data found in file');
    }

    if (rows.length > this.MAX_ROWS) {
      throw new BadRequestException(`Maximum ${this.MAX_ROWS} rows allowed. Found ${rows.length} rows.`);
    }

    return this.processImport(rows, companyId);
  }

  private async parseCSV(buffer: Buffer): Promise<ProductImportRow[]> {
    const content = buffer.toString('utf-8');
    const lines = content.split(/\r?\n/).filter(line => line.trim());

    if (lines.length < 2) {
      return [];
    }

    const headers = this.parseCSVLine(lines[0]);
    const rows: ProductImportRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length === 0 || (values.length === 1 && values[0] === '')) {
        continue;
      }

      const row = this.mapToProductRow(headers, values, i + 1);
      if (row) {
        rows.push(row);
      }
    }

    return rows;
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  private async parseExcel(buffer: Buffer): Promise<ProductImportRow[]> {
    // Dynamic import for xlsx library
    const XLSX = await import('xlsx').then(m => m.default || m);

    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    if (data.length < 2) {
      return [];
    }

    const headers = data[0].map(h => String(h || '').toLowerCase().trim());
    const rows: ProductImportRow[] = [];

    for (let i = 1; i < data.length; i++) {
      const values = data[i];
      if (!values || values.length === 0 || values.every(v => !v)) {
        continue;
      }

      const row = this.mapToProductRow(headers, values.map(v => String(v || '')), i + 1);
      if (row) {
        rows.push(row);
      }
    }

    return rows;
  }

  private mapToProductRow(
    headers: string[],
    values: string[],
    rowNumber: number,
  ): ProductImportRow | null {
    const getValue = (fieldNames: string[]): string | undefined => {
      for (const name of fieldNames) {
        const index = headers.findIndex(h => h.includes(name.toLowerCase()));
        if (index !== -1 && values[index] !== undefined) {
          return values[index];
        }
      }
      return undefined;
    };

    const sku = getValue(['sku', 'code', 'item_code', 'itemcode']);
    const name = getValue(['name', 'product_name', 'productname', 'description']);

    if (!sku || !name) {
      return null;
    }

    const unitId = getValue(['unit_id', 'unitid', 'unit', 'uom']) || '';
    const costPrice = parseFloat(getValue(['cost_price', 'costprice', 'cost']) || '0');
    const sellingPrice = parseFloat(getValue(['selling_price', 'sellingprice', 'price', 'sale_price']) || '0');
    const minStock = parseInt(getValue(['min_stock', 'minstock', 'minimum_stock', 'reorder_point']) || '0', 10);
    const maxStock = parseInt(getValue(['max_stock', 'maxstock', 'maximum_stock']) || '0', 10) || undefined;
    const isActive = getValue(['is_active', 'isactive', 'active']) !== 'false';

    return {
      sku: sku.trim(),
      name: name.trim(),
      barcode: getValue(['barcode', 'upc', 'ean'])?.trim(),
      description: getValue(['description', 'desc'])?.trim(),
      categoryId: getValue(['category_id', 'categoryid', 'category'])?.trim(),
      unitId: unitId.trim(),
      costPrice: isNaN(costPrice) ? 0 : costPrice,
      sellingPrice: isNaN(sellingPrice) ? 0 : sellingPrice,
      minStock: isNaN(minStock) ? 0 : minStock,
      maxStock: isNaN(maxStock!) ? undefined : maxStock,
      isActive,
    };
  }

  private async processImport(
    rows: ProductImportRow[],
    companyId: string,
  ): Promise<ImportResult> {
    const errors: ImportError[] = [];
    const successProducts: ProductImportRow[] = [];

    // Get all units for validation
    const units = await this.prisma.unit.findMany({
      where: { companyId },
      select: { id: true, name: true },
    });
    const unitIds = new Set(units.map(u => u.id));

    // Get all categories for validation
    const categories = await this.prisma.category.findMany({
      where: { companyId },
      select: { id: true },
    });
    const categoryIds = new Set(categories.map(c => c.id));

    // Track SKUs seen in this import
    const seenSkus = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +2 for 1-based index and header row

      // Validate required fields
      if (!row.sku) {
        errors.push({ row: rowNumber, field: 'sku', message: 'SKU is required' });
        continue;
      }

      if (!row.name) {
        errors.push({ row: rowNumber, sku: row.sku, field: 'name', message: 'Name is required' });
        continue;
      }

      if (!row.unitId) {
        errors.push({ row: rowNumber, sku: row.sku, field: 'unitId', message: 'Unit is required' });
        continue;
      }

      // Validate unit exists
      if (!unitIds.has(row.unitId)) {
        errors.push({ row: rowNumber, sku: row.sku, field: 'unitId', message: `Unit "${row.unitId}" not found` });
        continue;
      }

      // Validate category exists if provided
      if (row.categoryId && !categoryIds.has(row.categoryId)) {
        errors.push({ row: rowNumber, sku: row.sku, field: 'categoryId', message: `Category "${row.categoryId}" not found` });
        continue;
      }

      // Check for duplicate SKU within file
      if (seenSkus.has(row.sku.toLowerCase())) {
        errors.push({ row: rowNumber, sku: row.sku, field: 'sku', message: 'Duplicate SKU in file' });
        continue;
      }
      seenSkus.add(row.sku.toLowerCase());

      // Check for duplicate SKU in database
      const existingProduct = await this.productRepository.skuExists(row.sku, companyId);
      if (existingProduct) {
        errors.push({ row: rowNumber, sku: row.sku, field: 'sku', message: 'SKU already exists in database' });
        continue;
      }

      // Check barcode uniqueness if provided
      if (row.barcode) {
        const existingBarcode = await this.productRepository.barcodeExists(row.barcode, companyId);
        if (existingBarcode) {
          errors.push({ row: rowNumber, sku: row.sku, field: 'barcode', message: `Barcode "${row.barcode}" already exists` });
          continue;
        }
      }

      // Validate numeric fields
      if (row.costPrice < 0) {
        errors.push({ row: rowNumber, sku: row.sku, field: 'costPrice', message: 'Cost price cannot be negative' });
        continue;
      }

      if (row.sellingPrice < 0) {
        errors.push({ row: rowNumber, sku: row.sku, field: 'sellingPrice', message: 'Selling price cannot be negative' });
        continue;
      }

      successProducts.push(row);
    }

    // Bulk create successful products
    let successCount = 0;
    for (const product of successProducts) {
      try {
        await this.productRepository.create({
          ...product,
          companyId,
        });
        successCount++;
      } catch (error) {
        this.logger.error(`Failed to create product ${product.sku}: ${error.message}`);
        errors.push({
          row: successProducts.indexOf(product) + 2,
          sku: product.sku,
          field: 'system',
          message: `Failed to create: ${error.message}`,
        });
      }
    }

    return {
      successCount,
      errorCount: errors.length,
      errors,
      totalRows: rows.length,
    };
  }

  async generateImportTemplate(): Promise<Buffer> {
    const XLSX = await import('xlsx').then(m => m.default || m);

    const headers = [
      'SKU',
      'Name',
      'Barcode',
      'Description',
      'Category_ID',
      'Unit_ID',
      'Cost_Price',
      'Selling_Price',
      'Min_Stock',
      'Max_Stock',
      'Is_Active',
    ];

    const exampleData = [
      ['SKU-001', 'Product Name', '1234567890', 'Product description', 'cat-uuid', 'unit-uuid', '100', '150', '10', '100', 'true'],
      ['SKU-002', 'Another Product', '', 'Another description', '', 'unit-uuid', '50', '75', '5', '', 'true'],
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...exampleData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }
}
