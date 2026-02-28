'use client';

import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function RegisterPage() {
  const t = useTranslations('auth.register');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
          <CardDescription>{t('subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600">{t('hasAccount')} </span>
            <Link href="/login" className="text-blue-600 hover:underline">
              {t('signIn')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
