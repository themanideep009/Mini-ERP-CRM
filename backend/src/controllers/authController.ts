import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService.js';
import { successResponse } from '../utils/responses.js';
import { AuthenticatedRequest } from '../types/index.js';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await authService.registerUser(req.body);
    successResponse(res, 201, 'User registered successfully', user);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.loginUser(req.body);
    successResponse(res, 200, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const user = await authService.getUserProfile(userId);
    successResponse(res, 200, 'User profile fetched successfully', user);
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, name, role } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Google account email is required' });
      return;
    }
    const result = await authService.googleLoginUser({ email, name, role });
    successResponse(res, 200, 'Google Login successful', result);
  } catch (error) {
    next(error);
  }
};

