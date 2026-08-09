import * as challanService from '../services/challanService.js';
import { challanSchema } from '../validators/challan.js';
import { successResponse } from '../utils/responses.js';

export const getChallans = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const result = await challanService.getChallans({ status, page, limit });
    return successResponse(res, 200, 'Sales challans fetched successfully', result);
  } catch (error) {
    next(error);
  }
};

export const getChallanById = async (req, res, next) => {
  try {
    const challan = await challanService.getChallanById(req.params.id);
    return successResponse(res, 200, 'Challan details fetched successfully', challan);
  } catch (error) {
    next(error);
  }
};

export const createChallan = async (req, res, next) => {
  try {
    const validatedData = challanSchema.parse(req.body);
    const newChallan = await challanService.createChallan(validatedData, req.user.userId);
    return successResponse(res, 201, 'Sales challan draft created successfully', newChallan);
  } catch (error) {
    next(error);
  }
};

export const updateChallan = async (req, res, next) => {
  try {
    const validatedData = challanSchema.parse(req.body);
    const updatedChallan = await challanService.updateChallan(req.params.id, validatedData, req.user.userId);
    return successResponse(res, 200, 'Sales challan updated successfully', updatedChallan);
  } catch (error) {
    next(error);
  }
};

export const confirmChallan = async (req, res, next) => {
  try {
    const confirmedChallan = await challanService.confirmChallan(req.params.id, req.user.userId);
    return successResponse(res, 200, 'Sales challan confirmed successfully and stock deducted', confirmedChallan);
  } catch (error) {
    next(error);
  }
};

export const cancelChallan = async (req, res, next) => {
  try {
    const cancelledChallan = await challanService.cancelChallan(req.params.id, req.user.userId);
    return successResponse(res, 200, 'Sales challan cancelled successfully and stock restored', cancelledChallan);
  } catch (error) {
    next(error);
  }
};
