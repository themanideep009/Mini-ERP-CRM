import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/responses.js';

export interface AppError extends Error {
  statusCode?: number;
  errorCode?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(`[Error] ${err.message}`, err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errorCode = err.errorCode || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'ERROR');

  errorResponse(res, statusCode, message, errorCode);
};
