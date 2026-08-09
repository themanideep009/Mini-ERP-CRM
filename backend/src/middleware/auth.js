import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/responses.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <TOKEN>

  if (!token) {
    return errorResponse(res, 401, 'Access token is missing or invalid', 'UNAUTHORIZED');
  }

  try {
    const secret = process.env.JWT_SECRET || 'minierpcrmsupersecretkey1234567890';
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // Contains id, email, role
    next();
  } catch (error) {
    return errorResponse(res, 403, 'Token is invalid or expired', 'FORBIDDEN');
  }
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'User not authenticated', 'UNAUTHORIZED');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, 403, 'You do not have permission to perform this action', 'FORBIDDEN');
    }

    next();
  };
};
