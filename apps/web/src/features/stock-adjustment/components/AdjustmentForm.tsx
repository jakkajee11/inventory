'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Product } from '@/features/product/types/product.types';

interface AdjustmentFormValues {
  adjustmentType: string;
  warehouseId: string;
  notes?: string;
  items: Array<{
    productId: string;
    quantityAfter: number;
    reason?: string;
  }>;
}

interface AdjustmentFormProps {
  products: Product[];
  warehouses: { id: string; name: string }[];
  onSubmit: (data: AdjustmentFormValues) => void;
  isSubmitting?: boolean;
}

export function AdjustmentForm({ products, warehouses, onSubmit, isSubmitting }: AdjustmentFormProps) {
  const form = useForm<AdjustmentFormValues>({
    defaultValues: {
      adjustmentType: 'INVENTORY_COUNT',
      warehouseId: '',
      notes: '',
      items: [{ productId: '', quantityAfter: 0, reason: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="adjustmentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adjustment Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="INVENTORY_COUNT">Inventory Count</SelectItem>
                    <SelectItem value="DAMAGE">Damage</SelectItem>
                    <SelectItem value="THEFT">Theft</SelectItem>
                    <SelectItem value="EXPIRATION">Expiration</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="warehouseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Warehouse</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {warehouses.map((wh) => (
                      <SelectItem key={wh.id} value={wh.id}>
                        {wh.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Optional notes..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Items</h3>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: '', quantityAfter: 0, reason: '' })}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => {
              const selectedProductId = form.watch(`items.${index}.productId`);
              const selectedProduct = products.find(p => p.id === selectedProductId);

              return (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-start p-4 border rounded-lg">
                  <div className="col-span-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.productId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {products.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.sku} - {p.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantityAfter`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Quantity</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-4 pt-8">
                    {selectedProduct && (
                      <div className="text-sm">
                        <p>Current: {selectedProduct.currentStock} {selectedProduct.unit?.abbreviation}</p>
                        <p className={form.watch(`items.${index}.quantityAfter`) < selectedProduct.currentStock ? 'text-red-500' : 'text-green-600'}>
                          Diff: {form.watch(`items.${index}.quantityAfter`) - selectedProduct.currentStock}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="col-span-2 pt-8">
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => form.reset()}>Reset</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Adjustment'}</Button>
        </div>
      </form>
    </Form>
  );
}
