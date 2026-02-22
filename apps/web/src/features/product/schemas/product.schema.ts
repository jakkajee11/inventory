import { z } from 'zod';

export const productSchema = z.object({
  sku: z.string().min(3, 'SKU must be at least 3 characters').max(50),
  barcode: z.string().max(50).optional().or(z.literal('')),
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  description: z.string().max(1000).optional().or(z.literal('')),
  categoryId: z.string().uuid().optional().or(z.literal('')),
  unitId: z.string().uuid({ message: 'Unit is required' }),
  costPrice: z.number().min(0).default(0),
  sellingPrice: z.number().min(0).default(0),
  minStock: z.number().min(0).default(0),
  maxStock: z.number().min(0).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export const createProductSchema = productSchema;
export const updateProductSchema = productSchema.partial().extend({
  version: z.number(),
});

export type ProductFormData = z.infer<typeof productSchema>;
export type CreateProductFormData = z.infer<typeof createProductSchema>;
export type UpdateProductFormData = z.infer<typeof updateProductSchema>;
