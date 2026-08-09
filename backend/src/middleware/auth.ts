import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, JwtPayload, Role } from '../types/index.js';
import { errorResponse } from '../utils/responses.js';

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    errorResponse(res, 401, 'Access token missing or invalid', 'UNAUTHORIZED');
    return;
  }

  const secret = process.env.JWT_SECRET || 'minierpcrmsupersecretkey1234567890';

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    errorResponse(res, 403, 'Invalid or expired token', 'FORBIDDEN');
    return;
  }
};

export const requireRole = (...allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      errorResponse(res, 401, 'User authentication required', 'UNAUTHORIZED');
      return;
    }

    if (req.user.role === 'ADMIN') {
      next();
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      errorResponse(
        res,
        403,
        `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]`,
        'INSUFFICIENT_PERMISSIONS'
      );
      return;
    }

    next();
  };
};
