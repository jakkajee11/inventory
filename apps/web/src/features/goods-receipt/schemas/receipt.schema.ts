import { z } from 'zod';

const receiptItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unitCost: z.number().min(0, 'Unit cost must be non-negative'),
  notes: z.string().optional(),
});

export const createReceiptSchema = z.object({
  supplierName: z.string().min(1, 'Supplier name is required'),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  notes: z.string().optional(),
  items: z.array(receiptItemSchema).min(1, 'At least one item is required'),
});

export const updateReceiptItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unitCost: z.number().min(0, 'Unit cost must be non-negative'),
  notes: z.string().optional(),
});

export const updateReceiptSchema = z.object({
  supplierName: z.string().min(1, 'Supplier name is required').optional(),
  warehouseId: z.string().min(1, 'Warehouse is required').optional(),
  notes: z.string().optional(),
  items: z.array(updateReceiptItemSchema).min(1, 'At least one item is required').optional(),
});

export type CreateReceiptFormData = z.infer<typeof createReceiptSchema>;
export type UpdateReceiptFormData = z.infer<typeof updateReceiptSchema>;
