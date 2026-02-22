import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationRepository } from './infrastructure/notification.repository';
import { NotificationType } from './domain/entities/notification.entity';

@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async checkLowStockAlerts(companyId: string): Promise<void> {
    this.logger.log(`Checking low stock alerts for company ${companyId}`);

    // Find all products below minimum stock
    const lowStockProducts = await this.prisma.product.findMany({
      where: {
        companyId,
        deletedAt: null,
        isActive: true,
        currentStock: { lte: this.prisma.product.fields.minStock },
      },
      include: { unit: true },
    });

    // Get all active users for this company
    const users = await this.prisma.user.findMany({
      where: {
        companyId,
        deletedAt: null,
        isActive: true,
      },
      select: { id: true },
    });

    // Create notifications for each user and product
    for (const user of users) {
      for (const product of lowStockProducts) {
        const existingNotification = await this.prisma.notification.findFirst({
          where: {
            userId: user.id,
            type: NotificationType.LOW_STOCK,
            data: { productId: product.id },
            isRead: false,
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
          },
        });

        if (!existingNotification) {
          await this.notificationRepository.create({
            userId: user.id,
            type: product.currentStock === 0 ? NotificationType.ZERO_STOCK : NotificationType.LOW_STOCK,
            title: product.currentStock === 0 ? 'Out of Stock Alert' : 'Low Stock Alert',
            message: `${product.name} (${product.sku}) is ${product.currentStock === 0 ? 'out of stock' : `below minimum level. Current: ${product.currentStock} ${product.unit?.abbreviation || ''}`}`,
            data: {
              productId: product.id,
              productSku: product.sku,
              productName: product.name,
              currentStock: product.currentStock,
              minStock: product.minStock,
            },
            companyId,
          });
        }
      }
    }

    this.logger.log(`Created low stock alerts for ${lowStockProducts.length} products`);
  }

  async checkAllCompaniesLowStock(): Promise<void> {
    const companies = await this.prisma.company.findMany({
      where: { deletedAt: null },
      select: { id: true },
    });

    for (const company of companies) {
      await this.checkLowStockAlerts(company.id);
    }
  }
}
