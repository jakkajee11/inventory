import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './application/dtos/product.dto';
import { Product } from './domain/entities/product.entity';

@ApiTags('products')
@Controller('products')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of products' })
  async findAll(
    @Request() req: { user: { companyId: string } },
    @Query() query: ProductQueryDto,
  ) {
    return this.productService.findAll(req.user.companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Product details' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ): Promise<Product> {
    return this.productService.findById(id, req.user.companyId);
  }

  @Get('sku/:sku')
  @ApiOperation({ summary: 'Get product by SKU' })
  @ApiParam({ name: 'sku', description: 'Product SKU' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Product details' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  async findBySku(
    @Param('sku') sku: string,
    @Request() req: { user: { companyId: string } },
  ): Promise<Product | null> {
    return this.productService.findBySku(sku, req.user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Product created' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'SKU or barcode already exists' })
  async create(
    @Body() dto: CreateProductDto,
    @Request() req: { user: { companyId: string } },
  ): Promise<Product> {
    return this.productService.create(req.user.companyId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiQuery({ name: 'version', description: 'Current version for optimistic locking', required: false })
  @ApiResponse({ status: HttpStatus.OK, description: 'Product updated' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'SKU or barcode already exists' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Version mismatch' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @Request() req: { user: { companyId: string } },
    @Query('version') version?: number,
  ): Promise<Product> {
    return this.productService.update(id, req.user.companyId, dto, version);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product (soft delete)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Product deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ): Promise<void> {
    return this.productService.delete(id, req.user.companyId);
  }
}
