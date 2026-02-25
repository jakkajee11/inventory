import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotificationRepository } from '../infrastructure/notification.repository';
import { NotificationType } from '../domain/entities/notification.entity';

@Injectable()
export class StockAlertJob {
  private readonly logger = new Logger(StockAlertJob.name);
  private isRunning = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  /**
   * Run daily at 6:00 AM to check stock levels and create alerts
   */
  @Cron(CronExpression.EVERY_DAY_AT_6AM, {
    name: 'stockAlertJob',
    timeZone: 'Asia/Bangkok',
  })
  async handleDailyStockAlerts(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Stock alert job is already running, skipping...');
      return;
    }

    this.isRunning = true;
    this.logger.log('Starting daily stock alert job...');

    try {
      await this.checkAllCompaniesLowStock();
      this.logger.log('Daily stock alert job completed successfully');
    } catch (error) {
      this.logger.error(`Stock alert job failed: ${error.message}`, error.stack);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Check low stock for all active companies
   */
  async checkAllCompaniesLowStock(): Promise<void> {
    const companies = await this.prisma.company.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    });

    this.logger.log(`Checking stock alerts for ${companies.length} companies`);

    for (const company of companies) {
      try {
        await this.checkCompanyLowStock(company.id, company.name);
      } catch (error) {
        this.logger.error(
          `Failed to check stock alerts for company ${company.id}: ${error.message}`,
        );
      }
    }
  }

  /**
   * Check low stock for a specific company
   */
  async checkCompanyLowStock(companyId: string, companyName?: string): Promise<{
    lowStockCount: number;
    zeroStockCount: number;
    notificationsCreated: number;
  }> {
    this.logger.log(`Checking stock alerts for company ${companyId}${companyName ? ` (${companyName})` : ''}`);

    // Get current date for limiting alerts to 1 per product per day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all products with low or zero stock
    const products = await this.prisma.product.findMany({
      where: {
        companyId,
        deletedAt: null,
        isActive: true,
        OR: [
          { currentStock: 0 },
          { currentStock: { lte: this.prisma.product.fields.minStock } },
        ],
      },
      include: { unit: true },
    });

    let lowStockCount = 0;
    let zeroStockCount = 0;
    let notificationsCreated = 0;

    // Get all active users for this company
    const users = await this.prisma.user.findMany({
      where: {
        companyId,
        deletedAt: null,
        isActive: true,
      },
      select: { id: true },
    });

    if (users.length === 0) {
      this.logger.warn(`No active users found for company ${companyId}`);
      return { lowStockCount: 0, zeroStockCount: 0, notificationsCreated: 0 };
    }

    for (const product of products) {
      const isZeroStock = product.currentStock === 0;

      if (isZeroStock) {
        zeroStockCount++;
      } else {
        lowStockCount++;
      }

      // Check if we already created an alert for this product today
      const existingAlert = await this.prisma.notification.findFirst({
        where: {
          companyId,
          type: isZeroStock ? NotificationType.ZERO_STOCK : NotificationType.LOW_STOCK,
          data: {
            path: ['productId'],
            equals: product.id,
          },
          createdAt: { gte: today },
        },
      });

      if (existingAlert) {
        this.logger.debug(`Alert already exists for product ${product.sku} today, skipping`);
        continue;
      }

      // Create notifications for all active users
      for (const user of users) {
        try {
          await this.notificationRepository.create({
            userId: user.id,
            type: isZeroStock ? NotificationType.ZERO_STOCK : NotificationType.LOW_STOCK,
            title: isZeroStock ? 'Out of Stock Alert' : 'Low Stock Alert',
            message: isZeroStock
              ? `${product.name} (${product.sku}) is out of stock!`
              : `${product.name} (${product.sku}) is below minimum level. Current: ${product.currentStock} ${product.unit?.abbreviation || ''}, Minimum: ${product.minStock}`,
            data: {
              productId: product.id,
              productSku: product.sku,
              productName: product.name,
              currentStock: product.currentStock,
              minStock: product.minStock,
              maxStock: product.maxStock,
              unitName: product.unit?.name,
            },
            companyId,
          });
          notificationsCreated++;
        } catch (error) {
          this.logger.error(
            `Failed to create notification for user ${user.id}: ${error.message}`,
          );
        }
      }
    }

    this.logger.log(
      `Company ${companyId}: Found ${zeroStockCount} out of stock, ${lowStockCount} low stock. Created ${notificationsCreated} notifications.`,
    );

    return { lowStockCount, zeroStockCount, notificationsCreated };
  }

  /**
   * Manually trigger stock alert check (for testing)
   */
  async triggerManualCheck(companyId?: string): Promise<any> {
    if (companyId) {
      return this.checkCompanyLowStock(companyId);
    }
    await this.checkAllCompaniesLowStock();
    return { message: 'Manual stock alert check completed' };
  }
}
