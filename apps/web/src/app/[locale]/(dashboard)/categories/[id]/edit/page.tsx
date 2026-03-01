'use client';

import { use } from 'react';
import { CategoryForm } from '@/features/category/components/CategoryForm';
import { useCategory } from '@/features/category/api/category.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations('categories');
  const { data: category, isLoading } = useCategory(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t('editCategory')}</h1>
        <Card>
          <CardContent className="py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t('editCategory')}</h1>
        <Card>
          <CardContent className="py-8">
            <p className="text-gray-500">Category not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('editCategory')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t('categoryDetails')}</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryForm category={category} />
        </CardContent>
      </Card>
    </div>
  );
}
