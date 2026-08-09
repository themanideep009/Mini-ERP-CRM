import { Request, Response, NextFunction } from 'express';
import * as customerService from '../services/customerService.js';
import { successResponse } from '../utils/responses.js';

export const getCustomers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await customerService.getCustomers(req.query);
    successResponse(res, 200, 'Customers fetched successfully', result.customers, result.meta);
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    successResponse(res, 200, 'Customer details fetched successfully', customer);
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customer = await customerService.createCustomer(req.body);
    successResponse(res, 201, 'Customer created successfully', customer);
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customer = await customerService.updateCustomer(req.params.id, req.body);
    successResponse(res, 200, 'Customer updated successfully', customer);
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await customerService.deleteCustomer(req.params.id);
    successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};
