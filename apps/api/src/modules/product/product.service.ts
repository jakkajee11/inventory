import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductRepository } from './infrastructure/product.repository';
import { Product } from './domain/entities/product.entity';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './application/dtos/product.dto';

export interface ProductListResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async create(companyId: string, dto: CreateProductDto): Promise<Product> {
    // Check SKU uniqueness
    if (await this.productRepository.skuExists(dto.sku, companyId)) {
      throw new ConflictException(`Product with SKU "${dto.sku}" already exists`);
    }

    // Check barcode uniqueness if provided
    if (dto.barcode && await this.productRepository.barcodeExists(dto.barcode, companyId)) {
      throw new ConflictException(`Product with barcode "${dto.barcode}" already exists`);
    }

    return this.productRepository.create({
      ...dto,
      companyId,
    });
  }

  async findById(id: string, companyId: string): Promise<Product> {
    const product = await this.productRepository.findById(id, companyId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async findAll(companyId: string, query: ProductQueryDto): Promise<ProductListResult> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const { products, total } = await this.productRepository.findAll(companyId, {
      skip,
      take: limit,
      search: query.search,
      categoryId: query.categoryId,
      includeInactive: query.includeInactive,
    });

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, companyId: string, dto: UpdateProductDto, currentVersion?: number): Promise<Product> {
    const existing = await this.findById(id, companyId);

    // Optimistic locking check
    if (currentVersion !== undefined && existing.version !== currentVersion) {
      throw new BadRequestException('Product was modified by another user. Please refresh and try again.');
    }

    // Check SKU uniqueness if changing
    if (dto.sku && dto.sku !== existing.sku) {
      if (await this.productRepository.skuExists(dto.sku, companyId, id)) {
        throw new ConflictException(`Product with SKU "${dto.sku}" already exists`);
      }
    }

    // Check barcode uniqueness if changing
    if (dto.barcode && dto.barcode !== existing.barcode) {
      if (await this.productRepository.barcodeExists(dto.barcode, companyId, id)) {
        throw new ConflictException(`Product with barcode "${dto.barcode}" already exists`);
      }
    }

    return this.productRepository.update(id, dto);
  }

  async delete(id: string, companyId: string): Promise<void> {
    await this.findById(id, companyId); // Verify exists
    await this.productRepository.softDelete(id);
  }

  async findBySku(sku: string, companyId: string): Promise<Product | null> {
    return this.productRepository.findBySku(sku, companyId);
  }

  async findByBarcode(barcode: string, companyId: string): Promise<Product | null> {
    return this.productRepository.findByBarcode(barcode, companyId);
  }
}
