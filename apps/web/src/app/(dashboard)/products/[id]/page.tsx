'use client';

import { use, Suspense } from 'react';
import { useProduct } from '@/features/product/api/product.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Pencil, ArrowLeft } from 'lucide-react';

function ProductDetailContent({ id }: { id: string }) {
  const { data: product, isLoading, error } = useProduct(id);

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>;
  }

  if (error || !product) {
    return <div className="text-red-500">Failed to load product</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-gray-500">{product.sku}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={product.isActive ? 'default' : 'secondary'}>
            {product.isActive ? 'Active' : 'Inactive'}
          </Badge>
          <Link href={`/products/${product.id}/edit`}>
            <Button>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">SKU</p>
                <p className="font-medium">{product.sku}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Barcode</p>
                <p className="font-medium">{product.barcode || '-'}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p className="font-medium">{product.description || '-'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium">{product.category?.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Unit</p>
                <p className="font-medium">{product.unit?.name || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Cost Price</p>
                <p className="font-medium text-lg">฿{product.costPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Selling Price</p>
                <p className="font-medium text-lg">฿{product.sellingPrice.toFixed(2)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Average Cost</p>
              <p className="font-medium">฿{product.averageCost.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Current Stock</p>
              <p className={`font-medium text-lg ${product.currentStock <= product.minStock ? 'text-red-600' : ''}`}>
                {product.currentStock} {product.unit?.abbreviation}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Min Stock</p>
                <p className="font-medium">{product.minStock}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Max Stock</p>
                <p className="font-medium">{product.maxStock || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Version</p>
                <p className="font-medium">{product.version}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant={product.isActive ? 'default' : 'secondary'}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">{new Date(product.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Updated</p>
                <p className="font-medium">{new Date(product.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  return (
    <div className="p-6">
      <Suspense fallback={<div>Loading...</div>}>
        <ProductDetailContent id={resolvedParams.id} />
      </Suspense>
    </div>
  );
}
