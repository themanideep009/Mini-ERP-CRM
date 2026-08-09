export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';
export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';
export type MovementType = 'IN' | 'OUT';
export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer {
  id: string;
  customerName: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber: string;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  challans?: SalesChallan[];
  _count?: {
    challans: number;
  };
}

export interface Product {
  id: string;
  productName: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minimumStock: number;
  warehouseLocation: string;
  createdAt: string;
  updatedAt: string;
  movements?: StockMovement[];
}

export interface StockMovement {
  id: string;
  productId: string;
  quantityChanged: number;
  movementType: MovementType;
  reason: string;
  createdBy: string | null;
  createdAt: string;
  product?: {
    productName: string;
    sku: string;
  };
  creator?: {
    name: string;
    email: string;
  };
}

export interface ChallanItem {
  id?: string;
  challanId?: string;
  productId: string;
  productNameSnapshot?: string;
  skuSnapshot?: string;
  unitPriceSnapshot?: number;
  quantity: number;
  subtotal?: number;
  product?: {
    currentStock: number;
    warehouseLocation: string;
  };
}

export interface SalesChallan {
  id: string;
  challanNumber: string;
  customerId: string;
  totalQuantity: number;
  status: ChallanStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    customerName: string;
    businessName: string;
    email?: string;
    mobile?: string;
    address?: string;
    gstNumber?: string;
  };
  creator?: {
    name: string;
    email?: string;
  };
  items?: ChallanItem[];
}

export interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
  error?: string;
}

export interface DashboardMetrics {
  role: Role;
  summary: {
    totalCustomers: number;
    totalProducts: number;
    totalStock: number;
    lowStockCount: number;
    totalChallans: number;
    confirmedChallans: number;
    draftChallans: number;
    totalInventoryValue: number;
  };
  lowStockProductsList: Product[];
  recentChallans: SalesChallan[];
  recentMovements: StockMovement[];
  customerDistribution: Record<string, number>;
}
