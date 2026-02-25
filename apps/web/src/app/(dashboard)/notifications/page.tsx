'use client';

import { NotificationList } from '@/features/notification/components/NotificationList';

export default function NotificationsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      <NotificationList pageSize={20} />
    </div>
  );
}
