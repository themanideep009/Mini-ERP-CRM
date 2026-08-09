import prisma from '../config/db.js';

export const getCustomers = async (query = {}) => {
  const { search = '', status, customerType, page = 1, limit = 10 } = query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Build filters
  const where = {};

  if (search) {
    where.OR = [
      { customerName: { contains: search, mode: 'insensitive' } },
      { businessName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { mobile: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (customerType) {
    where.customerType = customerType;
  }

  // Fetch count and records concurrently
  const [totalItems, customers] = await prisma.$transaction([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
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

export const getCustomerById = async (id) => {
  const customer = await prisma.customer.findUnique({
    where: { id },
  });

  if (!customer) {
    const err = new Error(`Customer with ID ${id} not found`);
    err.statusCode = 404;
    err.errorCode = 'CUSTOMER_NOT_FOUND';
    throw err;
  }

  return customer;
};

export const createCustomer = async (customerData) => {
  return await prisma.customer.create({
    data: customerData,
  });
};

export const updateCustomer = async (id, customerData) => {
  // Ensure customer exists first
  await getCustomerById(id);

  return await prisma.customer.update({
    where: { id },
    data: customerData,
  });
};

export const deleteCustomer = async (id) => {
  // Ensure customer exists
  await getCustomerById(id);

  // Check if they have associated challans
  const associatedChallans = await prisma.salesChallan.count({
    where: { customerId: id },
  });

  if (associatedChallans > 0) {
    const err = new Error('Cannot delete customer with associated sales challans');
    err.statusCode = 400;
    err.errorCode = 'CUSTOMER_HAS_CHALLANS';
    throw err;
  }

  return await prisma.customer.delete({
    where: { id },
  });
};
