import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { AlertService } from './alert.service';
import { NotificationRepository } from './infrastructure/notification.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationController],
  providers: [NotificationService, AlertService, NotificationRepository],
  exports: [NotificationService, AlertService],
})
export class NotificationModule {}
