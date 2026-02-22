import { Module } from '@nestjs/common';
import { GoodsIssueService } from './goods-issue.service';
import { GoodsIssueController } from './goods-issue.controller';
import { GoodsIssueRepository } from './infrastructure/goods-issue.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GoodsIssueController],
  providers: [GoodsIssueService, GoodsIssueRepository],
  exports: [GoodsIssueService],
})
export class GoodsIssueModule {}
