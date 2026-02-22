import { Module } from '@nestjs/common';
import { GoodsReceiptService } from './goods-receipt.service';
import { GoodsReceiptController } from './goods-receipt.controller';
import { GoodsReceiptRepository } from './infrastructure/goods-receipt.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GoodsReceiptController],
  providers: [GoodsReceiptService, GoodsReceiptRepository],
  exports: [GoodsReceiptService],
})
export class GoodsReceiptModule {}
