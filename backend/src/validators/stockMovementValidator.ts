import { z } from 'zod';

export const createStockMovementSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantityChanged: z.number().int().min(1, 'Quantity changed must be at least 1'),
  movementType: z.enum(['IN', 'OUT']),
  reason: z.string().min(3, 'Reason is required'),
});
