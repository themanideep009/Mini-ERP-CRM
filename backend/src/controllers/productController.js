import * as productService from '../services/productService.js';
import { productSchema, stockMovementSchema } from '../validators/product.js';
import { successResponse } from '../utils/responses.js';

export const getProducts = async (req, res, next) => {
  try {
    const { search, category, page, limit } = req.query;
    const result = await productService.getProducts({ search, category, page, limit });
    return successResponse(res, 200, 'Products fetched successfully', result);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    return successResponse(res, 200, 'Product details fetched successfully', product);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const validatedData = productSchema.parse(req.body);
    const newProduct = await productService.createProduct(validatedData, req.user.userId);
    return successResponse(res, 201, 'Product created successfully', newProduct);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const validatedData = productSchema.parse(req.body);
    const updatedProduct = await productService.updateProduct(req.params.id, validatedData);
    return successResponse(res, 200, 'Product updated successfully', updatedProduct);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    return successResponse(res, 200, 'Product deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const getStockMovements = async (req, res, next) => {
  try {
    const movements = await productService.getStockMovementsByProductId(req.params.id);
    return successResponse(res, 200, 'Stock movements fetched successfully', movements);
  } catch (error) {
    next(error);
  }
};

export const adjustStock = async (req, res, next) => {
  try {
    const validatedData = stockMovementSchema.parse(req.body);
    const result = await productService.createStockMovement(validatedData, req.user.userId);
    return successResponse(res, 201, 'Stock adjustment recorded successfully', result);
  } catch (error) {
    next(error);
  }
};
