import { Response } from 'express';
import { ApiResponse } from '../types/index.js';

export const successResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  meta?: any
): Response => {
  const responsePayload: ApiResponse<T> = {
    success: true,
    message,
    ...(data !== undefined && { data }),
    ...(meta !== undefined && { meta }),
  };
  return res.status(statusCode).json(responsePayload);
};

export const errorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  errorCode?: string
): Response => {
  const responsePayload: ApiResponse = {
    success: false,
    message,
    ...(errorCode && { error: errorCode }),
  };
  return res.status(statusCode).json(responsePayload);
};
