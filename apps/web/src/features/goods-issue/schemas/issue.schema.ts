import { z } from 'zod';

const issueItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  notes: z.string().optional(),
});

export const createIssueSchema = z.object({
  issueType: z.enum(['SALE', 'INTERNAL_USE', 'DAMAGED', 'LOST', 'RETURN_TO_SUPPLIER', 'OTHER']),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  notes: z.string().optional(),
  items: z.array(issueItemSchema).min(1, 'At least one item is required'),
});

export type CreateIssueFormData = z.infer<typeof createIssueSchema>;
