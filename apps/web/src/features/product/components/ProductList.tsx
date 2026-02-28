'use client';

import { useProducts } from '../hooks/useProducts';
import { ProductCard } from './ProductCard';
import { ProductSearch } from './ProductSearch';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export function ProductList() {
  const {
    products,
    total,
    page,
    totalPages,
    isLoading,
    query,
    setSearch,
    setPage,
    toggleInactive,
    refetch,
  } = useProducts();
  const t = useTranslations('products');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-gray-500">{t('productsTotal', { count: total })}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Link href="/products/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('addProduct')}
            </Button>
          </Link>
        </div>
      </div>

      <ProductSearch
        search={query.search || ''}
        onSearchChange={setSearch}
        includeInactive={query.includeInactive || false}
        onToggleInactive={toggleInactive}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">{t('messages.noProducts')}</p>
          <Link href="/products/new">
            <Button className="mt-4">{t('addFirstProduct')}</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            {t('pagination.previous')}
          </Button>
          <span className="py-2 px-4">
            {t('pagination.pageOf', { page, total: totalPages })}
          </span>
          <Button
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            {t('pagination.next')}
          </Button>
        </div>
      )}
    </div>
  );
}
