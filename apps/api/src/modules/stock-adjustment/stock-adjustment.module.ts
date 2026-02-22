import { Module } from '@nestjs/common';
import { StockAdjustmentService } from './stock-adjustment.service';
import { StockAdjustmentController } from './stock-adjustment.controller';
import { StockAdjustmentRepository } from './infrastructure/stock-adjustment.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StockAdjustmentController],
  providers: [StockAdjustmentService, StockAdjustmentRepository],
  exports: [StockAdjustmentService],
})
export class StockAdjustmentModule {}
