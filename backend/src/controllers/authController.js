import * as authService from '../services/authService.js';
import { registerSchema, loginSchema } from '../validators/auth.js';
import { successResponse } from '../utils/responses.js';

export const register = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const newUser = await authService.register(validatedData);
    return successResponse(res, 201, 'User registered successfully', newUser);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await authService.login(validatedData.email, validatedData.password);
    return successResponse(res, 200, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    // req.user is set by authenticateToken middleware
    const userProfile = await authService.getUserById(req.user.userId);
    return successResponse(res, 200, 'User profile fetched successfully', userProfile);
  } catch (error) {
    next(error);
  }
};
