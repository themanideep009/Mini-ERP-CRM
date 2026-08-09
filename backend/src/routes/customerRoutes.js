import express from 'express';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customerController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Read-only access allowed for ADMIN, SALES, and ACCOUNTS
router.get('/', requireRole('ADMIN', 'SALES', 'ACCOUNTS'), getCustomers);
router.get('/:id', requireRole('ADMIN', 'SALES', 'ACCOUNTS'), getCustomerById);

// Write access allowed only for ADMIN and SALES
router.post('/', requireRole('ADMIN', 'SALES'), createCustomer);
router.put('/:id', requireRole('ADMIN', 'SALES'), updateCustomer);
router.delete('/:id', requireRole('ADMIN', 'SALES'), deleteCustomer);

export default router;
