export type NotificationType = 'LOW_STOCK' | 'ZERO_STOCK' | 'APPROVAL_REQUIRED' | 'DOCUMENT_APPROVED' | 'DOCUMENT_REJECTED' | 'SYSTEM';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
