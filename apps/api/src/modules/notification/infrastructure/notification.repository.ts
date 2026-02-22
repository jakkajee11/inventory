import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Notification, NotificationType } from '../domain/entities/notification.entity';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, userId: string): Promise<Notification | null> {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    return notification ? this.mapToEntity(notification) : null;
  }

  async findByUser(
    userId: string,
    options?: {
      skip?: number;
      take?: number;
      unreadOnly?: boolean;
      type?: NotificationType;
    },
  ): Promise<{ notifications: Notification[]; total: number }> {
    const where = {
      userId,
      ...(options?.unreadOnly && { isRead: false }),
      ...(options?.type && { type: options.type }),
    };

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip: options?.skip,
        take: options?.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      notifications: notifications.map((n) => this.mapToEntity(n)),
      total,
    };
  }

  async create(data: Partial<Notification>): Promise<Notification> {
    const notification = await this.prisma.notification.create({
      data: {
        userId: data.userId!,
        type: data.type!,
        title: data.title!,
        message: data.message!,
        data: data.data ?? {},
        isRead: false,
        companyId: data.companyId!,
      },
    });
    return this.mapToEntity(notification);
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.prisma.notification.update({
      where: { id, userId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
    return this.mapToEntity(notification);
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
    return result.count;
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.prisma.notification.delete({
      where: { id, userId },
    });
  }

  async deleteAllRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.deleteMany({
      where: { userId, isRead: true },
    });
    return result.count;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  private mapToEntity(notification: any): Notification {
    const entity = new Notification();
    entity.id = notification.id;
    entity.userId = notification.userId;
    entity.type = notification.type as NotificationType;
    entity.title = notification.title;
    entity.message = notification.message;
    entity.data = notification.data;
    entity.isRead = notification.isRead;
    entity.readAt = notification.readAt;
    entity.companyId = notification.companyId;
    entity.createdAt = notification.createdAt;
    return entity;
  }
}
