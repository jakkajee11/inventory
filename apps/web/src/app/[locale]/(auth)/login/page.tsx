'use client';

import { LoginForm } from '@/features/auth/components/LoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const t = useTranslations('auth.login');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
          <CardDescription>{t('subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600">{t('noAccount')} </span>
            <Link href="/register" className="text-blue-600 hover:underline">
              {t('register')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
