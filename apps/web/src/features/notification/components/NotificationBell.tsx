'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useUnreadCount, useNotifications, useMarkAsRead, useMarkAllAsRead } from '../api/notification.api';
import Link from 'next/link';

const typeColors: Record<string, string> = {
  LOW_STOCK: 'bg-yellow-100 text-yellow-800',
  ZERO_STOCK: 'bg-red-100 text-red-800',
  APPROVAL_REQUIRED: 'bg-blue-100 text-blue-800',
  DOCUMENT_APPROVED: 'bg-green-100 text-green-800',
  DOCUMENT_REJECTED: 'bg-red-100 text-red-800',
  SYSTEM: 'bg-gray-100 text-gray-800',
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadCount();
  const { data } = useNotifications(1, 5);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const notifications = data?.notifications ?? [];

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now.getTime() - notificationDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <div className="flex items-start gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[notification.type] || typeColors.SYSTEM}`}>
                    {notification.type.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-400">{formatTime(notification.createdAt)}</span>
                </div>
                <p className="font-medium text-sm mt-1">{notification.title}</p>
                <p className="text-xs text-gray-600 mt-0.5">{notification.message}</p>
              </div>
            ))
          )}
        </div>
        <div className="p-2 border-t">
          <Link href="/notifications" onClick={() => setOpen(false)}>
            <Button variant="outline" className="w-full">View All</Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
