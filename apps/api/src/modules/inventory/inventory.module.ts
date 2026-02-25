import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryExportService } from './inventory-export.service';
import { InventoryController } from './inventory.controller';
import { InventoryRepository } from './infrastructure/inventory.repository';
import { StockCalculatorService } from './stock-calculator.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InventoryController],
  providers: [InventoryService, InventoryExportService, InventoryRepository, StockCalculatorService],
  exports: [InventoryService, InventoryExportService, StockCalculatorService],
})
export class InventoryModule {}
