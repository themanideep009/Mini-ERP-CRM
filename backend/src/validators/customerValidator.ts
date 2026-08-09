import { z } from 'zod';

export const createCustomerSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
  email: z.string().email('Invalid email address'),
  businessName: z.string().min(2, 'Business name is required'),
  gstNumber: z.string().min(5, 'GST number is required'),
  customerType: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']),
  address: z.string().min(5, 'Address is required'),
  status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).optional().default('LEAD'),
  followUpDate: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();
