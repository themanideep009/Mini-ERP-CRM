import { Router } from 'express';
import * as challanController from '../controllers/challanController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createChallanSchema, updateChallanSchema } from '../validators/challanValidator.js';

const router = Router();

router.use(authenticateToken);

router.get(
  '/',
  requireRole('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'),
  challanController.getChallans
);

router.get(
  '/:id',
  requireRole('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'),
  challanController.getChallanById
);

router.post(
  '/',
  requireRole('ADMIN', 'SALES'),
  validate(createChallanSchema),
  challanController.createChallan
);

router.put(
  '/:id',
  requireRole('ADMIN', 'SALES'),
  validate(updateChallanSchema),
  challanController.updateChallan
);

router.post(
  '/:id/confirm',
  requireRole('ADMIN', 'SALES', 'WAREHOUSE'),
  challanController.confirmChallan
);

router.post(
  '/:id/cancel',
  requireRole('ADMIN', 'SALES'),
  challanController.cancelChallan
);

export default router;
