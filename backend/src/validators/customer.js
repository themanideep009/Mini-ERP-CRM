import { z } from 'zod';

export const customerSchema = z.object({
  customerName: z.string().min(2, { message: 'Customer name must be at least 2 characters long' }),
  mobile: z.string().regex(/^[0-9]{10}$/, { message: 'Mobile number must be exactly 10 digits' }),
  email: z.string().email({ message: 'Invalid email address' }),
  businessName: z.string().min(2, { message: 'Business name is required' }),
  gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}$/i, {
    message: 'Invalid GST format (15 characters, e.g. 07AAAAA1111A1Z1)',
  }).transform((val) => val.toUpperCase()),
  customerType: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR'], {
    errorMap: () => ({ message: 'Customer type must be RETAIL, WHOLESALE, or DISTRIBUTOR' }),
  }),
  address: z.string().min(5, { message: 'Address must be at least 5 characters long' }),
  status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).default('LEAD'),
  followUpDate: z.string().nullable().optional().transform((val) => (val ? new Date(val) : null)),
  notes: z.string().nullable().optional().default(''),
});
