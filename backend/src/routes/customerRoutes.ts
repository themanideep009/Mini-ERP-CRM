import { Router } from 'express';
import * as customerController from '../controllers/customerController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createCustomerSchema, updateCustomerSchema } from '../validators/customerValidator.js';

const router = Router();

router.use(authenticateToken);

router.get(
  '/',
  requireRole('ADMIN', 'SALES', 'ACCOUNTS'),
  customerController.getCustomers
);

router.get(
  '/:id',
  requireRole('ADMIN', 'SALES', 'ACCOUNTS'),
  customerController.getCustomerById
);

router.post(
  '/',
  requireRole('ADMIN', 'SALES'),
  validate(createCustomerSchema),
  customerController.createCustomer
);

router.put(
  '/:id',
  requireRole('ADMIN', 'SALES'),
  validate(updateCustomerSchema),
  customerController.updateCustomer
);

router.delete(
  '/:id',
  requireRole('ADMIN'),
  customerController.deleteCustomer
);

export default router;
