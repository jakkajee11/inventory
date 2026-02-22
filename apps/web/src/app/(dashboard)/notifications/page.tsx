'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCheck, Package, Check } from 'lucide-react';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/features/notification/api/notification.api';

const typeIcons: Record<string, any> = {
  LOW_STOCK: Package,
  ZERO_STOCK: Package,
  APPROVAL_REQUIRED: Bell,
  DOCUMENT_APPROVED: Check,
  DOCUMENT_REJECTED: Bell,
  SYSTEM: Bell,
};

const typeColors: Record<string, string> = {
  LOW_STOCK: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ZERO_STOCK: 'bg-red-100 text-red-800 border-red-200',
  APPROVAL_REQUIRED: 'bg-blue-100 text-blue-800 border-blue-200',
  DOCUMENT_APPROVED: 'bg-green-100 text-green-800 border-green-200',
  DOCUMENT_REJECTED: 'bg-red-100 text-red-800 border-red-200',
  SYSTEM: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useNotifications(page);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const notifications = data?.notifications ?? [];
  const pagination = data?.pagination;
  const unreadCount = data?.unreadCount ?? 0;

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-gray-500">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={() => markAllAsRead.mutate()} disabled={markAllAsRead.isPending}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All as Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-10">
          <Bell className="h-12 w-12 mx-auto text-gray-400" />
          <p className="text-gray-500 mt-4">No notifications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = typeIcons[notification.type] || Bell;
            return (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-colors hover:shadow-md ${
                  !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''
                }`}
                onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${typeColors[notification.type] || typeColors.SYSTEM}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm">{notification.title}</p>
                        {!notification.isRead && (
                          <Badge variant="default" className="text-xs">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">{new Date(notification.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>
            Previous
          </Button>
          <span className="text-sm text-gray-500">Page {pagination.page} of {pagination.totalPages}</span>
          <Button variant="outline" onClick={() => setPage(p => p + 1)} disabled={page >= pagination.totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
