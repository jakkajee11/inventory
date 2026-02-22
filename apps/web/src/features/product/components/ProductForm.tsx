'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, type ProductFormData } from '../schemas/product.schema';
import { useCreateProduct, useUpdateProduct } from '../api/product.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import type { Product } from '../types/product.types';

interface ProductFormProps {
  product?: Product;
  units: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}

export function ProductForm({ product, units, categories }: ProductFormProps) {
  const router = useRouter();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const isEditing = !!product;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
      sku: product.sku,
      barcode: product.barcode || '',
      name: product.name,
      description: product.description || '',
      categoryId: product.categoryId || '',
      unitId: product.unitId,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      minStock: product.minStock,
      maxStock: product.maxStock,
      imageUrl: product.imageUrl || '',
      isActive: product.isActive,
    } : {
      costPrice: 0,
      sellingPrice: 0,
      minStock: 0,
      isActive: true,
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (isEditing && product) {
        await updateMutation.mutateAsync({
          id: product.id,
          data: { ...data, version: product.version },
        });
      } else {
        await createMutation.mutateAsync(data as any);
      }
      router.push('/products');
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">SKU *</label>
          <Input {...register('sku')} error={errors.sku?.message} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Barcode</label>
          <Input {...register('barcode')} error={errors.barcode?.message} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Name *</label>
        <Input {...register('name')} error={errors.name?.message} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          {...register('description')}
          className="w-full border rounded-md p-2"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select {...register('categoryId')} className="w-full border rounded-md p-2">
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Unit *</label>
          <select {...register('unitId')} className="w-full border rounded-md p-2">
            <option value="">Select unit</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>{unit.name}</option>
            ))}
          </select>
          {errors.unitId && <p className="text-red-500 text-sm">{errors.unitId.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Cost Price</label>
          <Input type="number" step="0.01" {...register('costPrice', { valueAsNumber: true })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Selling Price</label>
          <Input type="number" step="0.01" {...register('sellingPrice', { valueAsNumber: true })} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Min Stock</label>
          <Input type="number" {...register('minStock', { valueAsNumber: true })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Max Stock</label>
          <Input type="number" {...register('maxStock', { valueAsNumber: true })} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Image URL</label>
        <Input {...register('imageUrl')} />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" {...register('isActive')} id="isActive" />
        <label htmlFor="isActive" className="text-sm">Active</label>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}>
          {isEditing ? 'Update Product' : 'Create Product'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
