'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  CheckCheck,
  Package,
  Check,
  AlertTriangle,
  XCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '../api/notification.api';
import type { Notification, NotificationType } from '../types/notification.types';

const typeIcons: Record<NotificationType, any> = {
  LOW_STOCK: AlertTriangle,
  ZERO_STOCK: XCircle,
  APPROVAL_REQUIRED: Bell,
  DOCUMENT_APPROVED: Check,
  DOCUMENT_REJECTED: XCircle,
  SYSTEM: Info,
};

const typeColors: Record<NotificationType, string> = {
  LOW_STOCK: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ZERO_STOCK: 'bg-red-100 text-red-800 border-red-200',
  APPROVAL_REQUIRED: 'bg-blue-100 text-blue-800 border-blue-200',
  DOCUMENT_APPROVED: 'bg-green-100 text-green-800 border-green-200',
  DOCUMENT_REJECTED: 'bg-red-100 text-red-800 border-red-200',
  SYSTEM: 'bg-gray-100 text-gray-800 border-gray-200',
};

const typeLabels: Record<NotificationType, string> = {
  LOW_STOCK: 'Low Stock',
  ZERO_STOCK: 'Out of Stock',
  APPROVAL_REQUIRED: 'Approval Required',
  DOCUMENT_APPROVED: 'Approved',
  DOCUMENT_REJECTED: 'Rejected',
  SYSTEM: 'System',
};

export interface NotificationListProps {
  pageSize?: number;
  showMarkAllRead?: boolean;
  showDelete?: boolean;
  onNotificationClick?: (notification: Notification) => void;
}

export function NotificationList({
  pageSize = 20,
  showMarkAllRead = true,
  showDelete = true,
  onNotificationClick,
}: NotificationListProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useNotifications(page, pageSize);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  const notifications = data?.notifications ?? [];
  const pagination = data?.pagination;
  const unreadCount = data?.unreadCount ?? 0;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
    }
    onNotificationClick?.(notification);
  };

  const handleMarkAllRead = () => {
    markAllAsRead.mutate();
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotification.mutate(id);
  };

  const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10">
        <XCircle className="h-12 w-12 mx-auto text-red-400" />
        <p className="text-gray-500 mt-4">Failed to load notifications</p>
        <Button variant="outline" className="mt-4" onClick={() => setPage(page)}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Notifications</h2>
          <p className="text-sm text-gray-500">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        {showMarkAllRead && unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={markAllAsRead.isPending}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      {/* Notification List */}
      {notifications.length === 0 ? (
        <div className="text-center py-10">
          <Bell className="h-12 w-12 mx-auto text-gray-400" />
          <p className="text-gray-500 mt-4">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const Icon = typeIcons[notification.type] || Bell;
            const colorClass = typeColors[notification.type] || typeColors.SYSTEM;

            return (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  !notification.isRead
                    ? 'border-l-4 border-l-blue-500 bg-blue-50/50'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`p-2 rounded-lg border ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={colorClass}>
                          {typeLabels[notification.type]}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {formatTimestamp(notification.createdAt)}
                        </span>
                        {!notification.isRead && (
                          <Badge variant="default" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium text-sm mt-1">{notification.title}</p>
                      <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                    </div>

                    {/* Actions */}
                    {showDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-500"
                        onClick={(e) => handleDelete(e, notification.id)}
                        disabled={deleteNotification.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.totalPages}
            <span className="mx-2">|</span>
            {pagination.total} total
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
