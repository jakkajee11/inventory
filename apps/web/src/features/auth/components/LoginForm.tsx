'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '../schemas/login.schema';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export function LoginForm() {
  const { login, isLoading, loginError } = useAuth();
  const t = useTranslations('auth.login');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          type="email"
          placeholder={t('emailPlaceholder')}
          {...register('email')}
          error={errors.email?.message}
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <Input
          type="password"
          placeholder={t('passwordPlaceholder')}
          {...register('password')}
          error={errors.password?.message}
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
      </div>

      {loginError && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
          {t('invalidCredentials')}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
          {t('forgotPassword')}
        </Link>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? t('signingIn') : t('signIn')}
      </Button>
    </form>
  );
}
