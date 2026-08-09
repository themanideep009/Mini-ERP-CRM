import { Request, Response, NextFunction } from 'express';
import * as challanService from '../services/challanService.js';
import { successResponse } from '../utils/responses.js';
import { AuthenticatedRequest } from '../types/index.js';

export const getChallans = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await challanService.getChallans(req.query);
    successResponse(res, 200, 'Sales challans fetched successfully', result.challans, result.meta);
  } catch (error) {
    next(error);
  }
};

export const getChallanById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const challan = await challanService.getChallanById(req.params.id);
    successResponse(res, 200, 'Challan details fetched successfully', challan);
  } catch (error) {
    next(error);
  }
};

export const createChallan = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const challan = await challanService.createChallan(req.body, userId);
    successResponse(res, 201, 'Draft sales challan created successfully', challan);
  } catch (error) {
    next(error);
  }
};

export const updateChallan = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const challan = await challanService.updateChallan(req.params.id, req.body, userId);
    successResponse(res, 200, 'Draft sales challan updated successfully', challan);
  } catch (error) {
    next(error);
  }
};

export const confirmChallan = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const challan = await challanService.confirmChallan(req.params.id, userId);
    successResponse(res, 200, 'Sales challan confirmed successfully and stock updated', challan);
  } catch (error) {
    next(error);
  }
};

export const cancelChallan = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const challan = await challanService.cancelChallan(req.params.id, userId);
    successResponse(res, 200, 'Sales challan cancelled successfully and stock restored', challan);
  } catch (error) {
    next(error);
  }
};
