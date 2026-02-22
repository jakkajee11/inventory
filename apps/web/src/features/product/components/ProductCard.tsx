'use client';

import Link from 'next/link';
import type { Product } from '../types/product.types';
import { useDeleteProduct } from '../api/product.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const deleteMutation = useDeleteProduct();

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteMutation.mutateAsync(product.id);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              <Link href={`/products/${product.id}`} className="hover:underline">
                {product.name}
              </Link>
            </CardTitle>
            <p className="text-sm text-gray-500">{product.sku}</p>
          </div>
          <Badge variant={product.isActive ? 'default' : 'secondary'}>
            {product.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Stock:</span>
            <span className={product.currentStock <= product.minStock ? 'text-red-600 font-medium' : ''}>
              {product.currentStock} {product.unit?.abbreviation}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Cost:</span>
            <span>฿{product.costPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Price:</span>
            <span className="font-medium">฿{product.sellingPrice.toFixed(2)}</span>
          </div>
          {product.category && (
            <div className="flex justify-between">
              <span className="text-gray-500">Category:</span>
              <span>{product.category.name}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Link href={`/products/${product.id}/edit`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Pencil className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
