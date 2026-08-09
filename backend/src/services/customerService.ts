import prisma from '../config/db.js';
import { Prisma } from '@prisma/client';
import { CustomerType, CustomerStatus, PaginationQuery } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

export const getCustomers = async (query: PaginationQuery) => {
  const { search, status, customerType, page = 1, limit = 10 } = query;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));
  const skip = (pageNum - 1) * limitNum;

  const where: Prisma.CustomerWhereInput = {};

  if (status) {
    where.status = status as CustomerStatus;
  }

  if (customerType) {
    where.customerType = customerType as CustomerType;
  }

  if (search) {
    where.OR = [
      { customerName: { contains: search } },
      { businessName: { contains: search } },
      { email: { contains: search } },
      { mobile: { contains: search } },
      { gstNumber: { contains: search } },
    ];
  }

  const [totalItems, customers] = await prisma.$transaction([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { challans: true },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limitNum);

  return {
    customers,
    meta: {
      totalItems,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
    },
  };
};

export const getCustomerById = async (id: string) => {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      challans: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          items: true,
        },
      },
    },
  });

  if (!customer) {
    const error: AppError = new Error(`Customer with ID ${id} not found`);
    error.statusCode = 404;
    error.errorCode = 'CUSTOMER_NOT_FOUND';
    throw error;
  }

  return customer;
};

export const createCustomer = async (data: {
  customerName: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber: string;
  customerType: CustomerType;
  address: string;
  status?: CustomerStatus;
  followUpDate?: string | null;
  notes?: string | null;
}) => {
  const { followUpDate, ...rest } = data;

  const customer = await prisma.customer.create({
    data: {
      ...rest,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
    },
  });

  return customer;
};

export const updateCustomer = async (
  id: string,
  data: Partial<{
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
  }>
) => {
  const existingCustomer = await prisma.customer.findUnique({ where: { id } });
  if (!existingCustomer) {
    const error: AppError = new Error(`Customer with ID ${id} not found`);
    error.statusCode = 404;
    error.errorCode = 'CUSTOMER_NOT_FOUND';
    throw error;
  }

  const { followUpDate, ...rest } = data;
  const updateData: Prisma.CustomerUpdateInput = { ...rest };

  if (followUpDate !== undefined) {
    updateData.followUpDate = followUpDate ? new Date(followUpDate) : null;
  }

  const updatedCustomer = await prisma.customer.update({
    where: { id },
    data: updateData,
  });

  return updatedCustomer;
};

export const deleteCustomer = async (id: string) => {
  const existingCustomer = await prisma.customer.findUnique({ where: { id } });
  if (!existingCustomer) {
    const error: AppError = new Error(`Customer with ID ${id} not found`);
    error.statusCode = 404;
    error.errorCode = 'CUSTOMER_NOT_FOUND';
    throw error;
  }

  await prisma.customer.delete({ where: { id } });
  return { message: 'Customer deleted successfully' };
};
