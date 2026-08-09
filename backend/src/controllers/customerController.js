import * as customerService from '../services/customerService.js';
import { customerSchema } from '../validators/customer.js';
import { successResponse } from '../utils/responses.js';

export const getCustomers = async (req, res, next) => {
  try {
    const { search, status, customerType, page, limit } = req.query;
    const result = await customerService.getCustomers({ search, status, customerType, page, limit });
    return successResponse(res, 200, 'Customers fetched successfully', result);
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req, res, next) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    return successResponse(res, 200, 'Customer details fetched successfully', customer);
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req, res, next) => {
  try {
    const validatedData = customerSchema.parse(req.body);
    const newCustomer = await customerService.createCustomer(validatedData);
    return successResponse(res, 201, 'Customer created successfully', newCustomer);
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const validatedData = customerSchema.parse(req.body);
    const updatedCustomer = await customerService.updateCustomer(req.params.id, validatedData);
    return successResponse(res, 200, 'Customer updated successfully', updatedCustomer);
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req, res, next) => {
  try {
    await customerService.deleteCustomer(req.params.id);
    return successResponse(res, 200, 'Customer deleted successfully');
  } catch (error) {
    next(error);
  }
};
