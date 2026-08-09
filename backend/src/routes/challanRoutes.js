import express from 'express';
import {
  getChallans,
  getChallanById,
  createChallan,
  updateChallan,
  confirmChallan,
  cancelChallan,
} from '../controllers/challanController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// View routes - accessible by ADMIN, SALES, WAREHOUSE, and ACCOUNTS
router.get('/', requireRole('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), getChallans);
router.get('/:id', requireRole('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), getChallanById);

// Modify/Action routes - accessible only by ADMIN and SALES
router.post('/', requireRole('ADMIN', 'SALES'), createChallan);
router.put('/:id', requireRole('ADMIN', 'SALES'), updateChallan);
router.post('/:id/confirm', requireRole('ADMIN', 'SALES'), confirmChallan);
router.post('/:id/cancel', requireRole('ADMIN', 'SALES'), cancelChallan);

export default router;
