import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductImportService } from './product-import.service';
import { ProductRepository } from './infrastructure/product.repository';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CategoryRepository } from './infrastructure/category.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProductController, CategoryController],
  providers: [ProductService, ProductImportService, ProductRepository, CategoryService, CategoryRepository],
  exports: [ProductService, ProductImportService, ProductRepository, CategoryService, CategoryRepository],
})
export class ProductModule {}
