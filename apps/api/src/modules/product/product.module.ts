import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductImportService } from './product-import.service';
import { ProductRepository } from './infrastructure/product.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProductController],
  providers: [ProductService, ProductImportService, ProductRepository],
  exports: [ProductService, ProductImportService, ProductRepository],
})
export class ProductModule {}
