'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '../schemas/register.schema';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function RegisterForm() {
  const { register: registerUser, isLoading, registerError } = useAuth();

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
          placeholder="Email address"
          {...register('email')}
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <Input
          type="password"
          placeholder="Password"
          {...register('password')}
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
      </div>

      <div>
        <Input
          type="password"
          placeholder="Confirm password"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
      </div>

      <div>
        <Input
          type="text"
          placeholder="Your full name"
          {...register('name')}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <Input
          type="text"
          placeholder="Company name"
          {...register('companyName')}
        />
        {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>}
      </div>

      <div>
        <Input
          type="text"
          placeholder="Tax ID (optional)"
          {...register('companyTaxId')}
        />
      </div>

      {registerError && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
          Registration failed. Please try again.
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  );
}
