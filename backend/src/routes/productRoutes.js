import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getStockMovements,
} from '../controllers/productController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// All logged-in users (ADMIN, SALES, WAREHOUSE, ACCOUNTS) can view products
router.get('/', requireRole('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), getProducts);
router.get('/:id', requireRole('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), getProductById);

// WAREHOUSE and ACCOUNTS can see stock movements
router.get('/:id/stock-movements', requireRole('ADMIN', 'WAREHOUSE', 'ACCOUNTS'), getStockMovements);

// Only ADMIN and WAREHOUSE can create, update, or delete products
router.post('/', requireRole('ADMIN', 'WAREHOUSE'), createProduct);
router.put('/:id', requireRole('ADMIN', 'WAREHOUSE'), updateProduct);
router.delete('/:id', requireRole('ADMIN', 'WAREHOUSE'), deleteProduct);

export default router;
