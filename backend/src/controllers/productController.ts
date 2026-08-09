import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/productService.js';
import { successResponse } from '../utils/responses.js';

export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await productService.getProducts(req.query);
    successResponse(res, 200, 'Products fetched successfully', result.products, result.meta);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await productService.getProductById(req.params.id);
    successResponse(res, 200, 'Product details fetched successfully', product);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await productService.createProduct(req.body);
    successResponse(res, 201, 'Product created successfully', product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    successResponse(res, 200, 'Product updated successfully', product);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await productService.deleteProduct(req.params.id);
    successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};

export const getProductStockMovements = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const movements = await productService.getStockMovementsByProduct(req.params.id);
    successResponse(res, 200, 'Product stock movements fetched successfully', movements);
  } catch (error) {
    next(error);
  }
};
