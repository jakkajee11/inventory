'use client';

import { CategoryForm } from '@/features/category/components/CategoryForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

export default function NewCategoryPage() {
  const t = useTranslations('categories');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('addCategory')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t('categoryDetails')}</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryForm />
        </CardContent>
      </Card>
    </div>
  );
}
