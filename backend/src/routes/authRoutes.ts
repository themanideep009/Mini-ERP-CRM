import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validators/authValidator.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/google-login', authController.googleLogin);
router.get('/me', authenticateToken, authController.getMe);

export default router;

