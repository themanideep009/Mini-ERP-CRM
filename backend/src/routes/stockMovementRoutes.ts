import { Router } from 'express';
import * as stockMovementController from '../controllers/stockMovementController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createStockMovementSchema } from '../validators/stockMovementValidator.js';

const router = Router();

router.use(authenticateToken);

router.get(
  '/',
  requireRole('ADMIN', 'WAREHOUSE', 'ACCOUNTS'),
  stockMovementController.getStockMovements
);

router.post(
  '/',
  requireRole('ADMIN', 'WAREHOUSE'),
  validate(createStockMovementSchema),
  stockMovementController.createStockMovement
);

export default router;
