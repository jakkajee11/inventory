'use client';

import { useAuthStore } from '@/stores/auth.store';
import { useTranslations } from 'next-intl';

export function WelcomeHeader() {
  const { user } = useAuthStore();
  const t = useTranslations('dashboard.greeting');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('morning');
    if (hour < 18) return t('afternoon');
    return t('evening');
  };

  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold tracking-tight">
        {getGreeting()}, {user?.name || 'User'}!
      </h1>
      <p className="text-muted-foreground">
        {t('welcomeMessage')}
      </p>
    </div>
  );
}
