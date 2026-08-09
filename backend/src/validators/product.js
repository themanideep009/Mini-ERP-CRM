import { z } from 'zod';

export const productSchema = z.object({
  productName: z.string().min(2, { message: 'Product name must be at least 2 characters long' }),
  sku: z.string().min(3, { message: 'SKU must be at least 3 characters long' }).transform((val) => val.toUpperCase()),
  category: z.string().min(2, { message: 'Category is required' }),
  unitPrice: z.number().positive({ message: 'Unit price must be greater than zero' }),
  currentStock: z.number().int().nonnegative({ message: 'Current stock cannot be negative' }).optional().default(0),
  minimumStock: z.number().int().nonnegative({ message: 'Minimum stock cannot be negative' }).optional().default(0),
  warehouseLocation: z.string().min(2, { message: 'Warehouse location is required' }),
});

export const stockMovementSchema = z.object({
  productId: z.string().uuid({ message: 'Invalid product ID' }),
  quantityChanged: z.number().int().refine((val) => val !== 0, { message: 'Quantity changed cannot be zero' }),
  movementType: z.enum(['IN', 'OUT']),
  reason: z.string().min(3, { message: 'Reason must be at least 3 characters' }),
});
