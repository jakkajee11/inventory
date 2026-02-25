import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { AlertService } from './alert.service';
import { NotificationRepository } from './infrastructure/notification.repository';
import { PrismaModule } from '../../prisma/prisma.module';
import { StockAlertJob } from './jobs/stock-alert.job';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationController],
  providers: [NotificationService, AlertService, NotificationRepository, StockAlertJob],
  exports: [NotificationService, AlertService, StockAlertJob],
})
export class NotificationModule {}
