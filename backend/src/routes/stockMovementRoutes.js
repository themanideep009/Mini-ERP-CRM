import express from 'express';
import { adjustStock } from '../controllers/productController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Only ADMIN and WAREHOUSE can record manual stock movements
router.post('/', authenticateToken, requireRole('ADMIN', 'WAREHOUSE'), adjustStock);

export default router;
