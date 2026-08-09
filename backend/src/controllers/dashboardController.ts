import { Response, NextFunction } from 'express';
import * as dashboardService from '../services/dashboardService.js';
import { successResponse } from '../utils/responses.js';
import { AuthenticatedRequest } from '../types/index.js';

export const getDashboardData = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const role = req.user!.role;
    const metrics = await dashboardService.getDashboardMetrics(role);
    successResponse(res, 200, 'Dashboard metrics fetched successfully', metrics);
  } catch (error) {
    next(error);
  }
};
