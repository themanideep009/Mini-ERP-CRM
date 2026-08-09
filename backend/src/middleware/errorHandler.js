import { ZodError } from 'zod';
import { errorResponse } from '../utils/responses.js';

export const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err);

  // 1. Zod Validation Error
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return errorResponse(res, 400, 'Validation failed', 'VALIDATION_ERROR', details);
  }

  // 2. Prisma Known Errors
  if (err.code) {
    switch (err.code) {
      case 'P2002': // Unique constraint failed
        const fields = err.meta?.target || [];
        return errorResponse(
          res,
          409,
          `Conflict: A record with this ${fields.join(', ')} already exists`,
          'CONFLICT'
        );
      case 'P2025': // Record not found
        return errorResponse(res, 404, 'The requested record was not found', 'NOT_FOUND');
      default:
        break;
    }
  }

  // 3. Custom App Errors (if they throw an object with statusCode)
  if (err.statusCode) {
    return errorResponse(res, err.statusCode, err.message, err.errorCode || 'BAD_REQUEST');
  }

  // 4. Default Internal Server Error
  return errorResponse(
    res,
    500,
    err.message || 'An internal server error occurred',
    'INTERNAL_SERVER_ERROR'
  );
};
