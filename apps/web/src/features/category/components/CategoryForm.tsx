'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateCategory, useUpdateCategory, useCategoryTree } from '../api/category.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { Category } from '../types/category.types';

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters'),
  description: z.string().max(500).optional(),
  parentId: z.string().optional().or(z.literal('')),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: Category;
}

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const t = useTranslations('categories');
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const { data: categoryTree } = useCategoryTree(true);
  const isEditing = !!category;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: category ? {
      name: category.name,
      description: category.description || '',
      parentId: category.parentId || '',
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    } : {
      sortOrder: 0,
      isActive: true,
    },
  });

  const flattenCategories = (cats: Category[] | undefined, level = 0, excludeId?: string): { id: string; name: string; level: number }[] => {
    if (!cats) return [];
    return cats.flatMap((cat) => {
      if (cat.id === excludeId) return [];
      const current = { id: cat.id, name: cat.name, level };
      const children = flattenCategories(cat.children, level + 1, excludeId);
      return [current, ...children];
    });
  };

  const flatCategories = flattenCategories(categoryTree, 0, category?.id);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const submitData = {
        ...data,
        parentId: data.parentId || undefined,
      };

      if (isEditing && category) {
        await updateMutation.mutateAsync({
          id: category.id,
          data: submitData,
        });
      } else {
        await createMutation.mutateAsync(submitData);
      }
      router.push('/categories');
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div>
        <label className="block text-sm font-medium mb-1">{t('form.name')} *</label>
        <Input
          {...register('name')}
          placeholder={t('placeholders.name')}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t('form.description')}</label>
        <textarea
          {...register('description')}
          placeholder={t('placeholders.description')}
          className="w-full border rounded-md p-2 min-h-[100px]"
          rows={3}
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t('form.parentCategory')}</label>
        <select
          {...register('parentId')}
          className="w-full border rounded-md p-2"
        >
          <option value="">{t('form.noParent')}</option>
          {flatCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {'  '.repeat(cat.level)}{cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t('form.sortOrder')}</label>
        <Input
          type="number"
          {...register('sortOrder', { valueAsNumber: true })}
          placeholder={t('placeholders.sortOrder')}
        />
        {errors.sortOrder && <p className="text-red-500 text-sm mt-1">{errors.sortOrder.message}</p>}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          {...register('isActive')}
          id="isActive"
          className="h-4 w-4"
        />
        <label htmlFor="isActive" className="text-sm">{t('form.active')}</label>
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
        >
          {isEditing ? t('editCategory') : t('addCategory')}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
