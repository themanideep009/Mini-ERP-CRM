import { Router } from 'express';
import * as productController from '../controllers/productController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createProductSchema, updateProductSchema } from '../validators/productValidator.js';

const router = Router();

router.use(authenticateToken);

router.get(
  '/',
  requireRole('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'),
  productController.getProducts
);

router.get(
  '/:id',
  requireRole('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'),
  productController.getProductById
);

router.post(
  '/',
  requireRole('ADMIN', 'WAREHOUSE'),
  validate(createProductSchema),
  productController.createProduct
);

router.put(
  '/:id',
  requireRole('ADMIN', 'WAREHOUSE'),
  validate(updateProductSchema),
  productController.updateProduct
);

router.delete(
  '/:id',
  requireRole('ADMIN'),
  productController.deleteProduct
);

router.get(
  '/:id/stock-movements',
  requireRole('ADMIN', 'WAREHOUSE'),
  productController.getProductStockMovements
);

export default router;
