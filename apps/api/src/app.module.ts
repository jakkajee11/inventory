import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';

import { configuration } from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { GoodsReceiptModule } from './modules/goods-receipt/goods-receipt.module';
import { GoodsIssueModule } from './modules/goods-issue/goods-issue.module';
import { StockAdjustmentModule } from './modules/stock-adjustment/stock-adjustment.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ReportModule } from './modules/report/report.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { HealthModule } from './common/modules/health.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),

    // Scheduling
    ScheduleModule.forRoot(),

    // Logging
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          level: config.get('LOG_LEVEL', 'info'),
          transport:
            config.get('NODE_ENV') !== 'production'
              ? { target: 'pino-pretty', options: { colorize: true } }
              : undefined,
        },
      }),
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Database
    PrismaModule,

    // Feature modules
    HealthModule,
    TenantModule,
    AuthModule,
    UserModule,
    ProductModule,
    InventoryModule,
    GoodsReceiptModule,
    GoodsIssueModule,
    StockAdjustmentModule,
    NotificationModule,
    ReportModule,
  ],
})
export class AppModule {}
