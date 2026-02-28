'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '../schemas/register.schema';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';

export function RegisterForm() {
  const { register: registerUser, isLoading, registerError } = useAuth();
  const t = useTranslations('auth.register');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
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
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <Input
          type="password"
          placeholder={t('passwordPlaceholder')}
          {...register('password')}
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
      </div>

      <div>
        <Input
          type="password"
          placeholder={t('confirmPasswordPlaceholder')}
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
      </div>

      <div>
        <Input
          type="text"
          placeholder={t('namePlaceholder')}
          {...register('name')}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <Input
          type="text"
          placeholder={t('companyPlaceholder')}
          {...register('companyName')}
        />
        {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>}
      </div>

      <div>
        <Input
          type="text"
          placeholder={t('taxIdPlaceholder')}
          {...register('companyTaxId')}
        />
      </div>

      {registerError && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
          {t('registrationFailed')}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? t('creatingAccount') : t('createAccount')}
      </Button>
    </form>
  );
}
