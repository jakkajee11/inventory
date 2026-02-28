'use client';

import { useAuthStore } from '@/stores/auth.store';

export function WelcomeHeader() {
  const { user } = useAuthStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold tracking-tight">
        {getGreeting()}, {user?.name || 'User'}!
      </h1>
      <p className="text-muted-foreground">
        Here&apos;s what&apos;s happening with your inventory today.
      </p>
    </div>
  );
}
