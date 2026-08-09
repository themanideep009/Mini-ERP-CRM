import { Request } from 'express';

export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';
export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';
export type MovementType = 'IN' | 'OUT';
export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}


export interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
  search?: string;
  status?: string;
  customerType?: string;
  category?: string;
  lowStock?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  error?: string;
}

export interface ChallanItemInput {
  productId: string;
  quantity: number;
}

export interface CreateChallanInput {
  customerId: string;
  items: ChallanItemInput[];
}

export interface StockMovementInput {
  productId: string;
  quantityChanged: number;
  movementType: MovementType;
  reason: string;
}
