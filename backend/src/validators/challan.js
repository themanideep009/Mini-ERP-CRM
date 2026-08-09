import { z } from 'zod';

const challanItemInputSchema = z.object({
  productId: z.string().uuid({ message: 'Invalid product ID' }),
  quantity: z.number().int().positive({ message: 'Quantity must be at least 1' }),
});

export const challanSchema = z.object({
  customerId: z.string().uuid({ message: 'Invalid customer ID' }),
  items: z.array(challanItemInputSchema).min(1, { message: 'Challan must contain at least one item' }),
});
