import { z } from 'zod';

const challanItemSchema = z.object({
  productId: z.string().uuid('Invalid Product ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const createChallanSchema = z.object({
  customerId: z.string().uuid('Invalid Customer ID'),
  items: z.array(challanItemSchema).min(1, 'At least one product item is required'),
});

export const updateChallanSchema = createChallanSchema;
