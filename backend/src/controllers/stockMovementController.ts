import { Response, NextFunction } from 'express';
import * as productService from '../services/productService.js';
import { successResponse } from '../utils/responses.js';
import { AuthenticatedRequest } from '../types/index.js';

export const getStockMovements = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await productService.getAllStockMovements(req.query);
    successResponse(res, 200, 'Stock movements fetched successfully', result.movements, result.meta);
  } catch (error) {
    next(error);
  }
};

export const createStockMovement = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const movement = await productService.createStockMovement(req.body, userId);
    successResponse(res, 201, 'Stock movement created successfully', movement);
  } catch (error) {
    next(error);
  }
};
