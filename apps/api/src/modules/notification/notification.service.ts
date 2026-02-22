import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationRepository } from './infrastructure/notification.repository';
import { Notification, NotificationType } from './domain/entities/notification.entity';

export interface NotificationQuery {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: NotificationType;
}

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async findByUser(userId: string, query: NotificationQuery) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const { notifications, total } = await this.notificationRepository.findByUser(userId, {
      skip,
      take: limit,
      unreadOnly: query.unreadOnly,
      type: query.type,
    });

    return {
      notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.getUnreadCount(userId);
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findById(id, userId);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return this.notificationRepository.markAsRead(id, userId);
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const count = await this.notificationRepository.markAllAsRead(userId);
    return { count };
  }

  async delete(id: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findById(id, userId);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    await this.notificationRepository.delete(id, userId);
  }

  async deleteAllRead(userId: string): Promise<{ count: number }> {
    const count = await this.notificationRepository.deleteAllRead(userId);
    return { count };
  }

  async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any>;
    companyId: string;
  }): Promise<Notification> {
    return this.notificationRepository.create(data);
  }
}
