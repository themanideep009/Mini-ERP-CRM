import prisma from '../config/db.js';
import { Prisma } from '@prisma/client';
import { ChallanStatus, CreateChallanInput, PaginationQuery } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

const generateChallanNumber = async (tx: Prisma.TransactionClient): Promise<string> => {
  const currentYear = new Date().getFullYear();
  const prefix = `CH-${currentYear}-`;

  const lastChallan = await tx.salesChallan.findFirst({
    where: {
      challanNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      challanNumber: 'desc',
    },
  });

  let nextSeqNum = 1;
  if (lastChallan) {
    const parts = lastChallan.challanNumber.split('-');
    const lastSeq = parseInt(parts[2], 10);
    if (!isNaN(lastSeq)) {
      nextSeqNum = lastSeq + 1;
    }
  }

  const seqStr = String(nextSeqNum).padStart(4, '0');
  return `${prefix}${seqStr}`;
};

export const getChallans = async (query: PaginationQuery) => {
  const { status, page = 1, limit = 10 } = query;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));
  const skip = (pageNum - 1) * limitNum;

  const where: Prisma.SalesChallanWhereInput = {};
  if (status) {
    where.status = status as ChallanStatus;
  }

  const [totalItems, challans] = await prisma.$transaction([
    prisma.salesChallan.count({ where }),
    prisma.salesChallan.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            customerName: true,
            businessName: true,
          },
        },
        creator: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limitNum);

  return {
    challans,
    meta: {
      totalItems,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
    },
  };
};

export const getChallanById = async (id: string) => {
  const challan = await prisma.salesChallan.findUnique({
    where: { id },
    include: {
      customer: true,
      creator: {
        select: {
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              currentStock: true,
              warehouseLocation: true,
            },
          },
        },
      },
    },
  });

  if (!challan) {
    const error: AppError = new Error(`Sales Challan with ID ${id} not found`);
    error.statusCode = 404;
    error.errorCode = 'CHALLAN_NOT_FOUND';
    throw error;
  }

  return challan;
};

export const createChallan = async (challanData: CreateChallanInput, userId: string) => {
  const { customerId, items } = challanData;

  return await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      const error: AppError = new Error('Customer not found');
      error.statusCode = 404;
      error.errorCode = 'CUSTOMER_NOT_FOUND';
      throw error;
    }

    let totalQuantity = 0;
    const challanItemsData = [];

    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        const error: AppError = new Error(`Product with ID ${item.productId} not found`);
        error.statusCode = 404;
        error.errorCode = 'PRODUCT_NOT_FOUND';
        throw error;
      }

      const subtotal = product.unitPrice * item.quantity;
      totalQuantity += item.quantity;

      challanItemsData.push({
        productId: product.id,
        productNameSnapshot: product.productName,
        skuSnapshot: product.sku,
        unitPriceSnapshot: product.unitPrice,
        quantity: item.quantity,
        subtotal,
      });
    }

    const challanNumber = await generateChallanNumber(tx);

    const newChallan = await tx.salesChallan.create({
      data: {
        challanNumber,
        customerId,
        totalQuantity,
        status: 'DRAFT',
        createdBy: userId,
        items: {
          create: challanItemsData,
        },
      },
      include: {
        items: true,
        customer: true,
      },
    });

    return newChallan;
  });
};

export const updateChallan = async (id: string, challanData: CreateChallanInput, userId: string) => {
  const { items } = challanData;

  return await prisma.$transaction(async (tx) => {
    const challan = await tx.salesChallan.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!challan) {
      const error: AppError = new Error('Challan not found');
      error.statusCode = 404;
      error.errorCode = 'CHALLAN_NOT_FOUND';
      throw error;
    }

    if (challan.status !== 'DRAFT') {
      const error: AppError = new Error('Only DRAFT challans can be updated');
      error.statusCode = 400;
      error.errorCode = 'INVALID_CHALLAN_STATUS';
      throw error;
    }

    await tx.challanItem.deleteMany({
      where: { challanId: id },
    });

    let totalQuantity = 0;
    const challanItemsData = [];

    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        const error: AppError = new Error(`Product with ID ${item.productId} not found`);
        error.statusCode = 404;
        error.errorCode = 'PRODUCT_NOT_FOUND';
        throw error;
      }

      const subtotal = product.unitPrice * item.quantity;
      totalQuantity += item.quantity;

      challanItemsData.push({
        productId: product.id,
        productNameSnapshot: product.productName,
        skuSnapshot: product.sku,
        unitPriceSnapshot: product.unitPrice,
        quantity: item.quantity,
        subtotal,
      });
    }

    const updatedChallan = await tx.salesChallan.update({
      where: { id },
      data: {
        totalQuantity,
        items: {
          create: challanItemsData,
        },
      },
      include: {
        items: true,
        customer: true,
      },
    });

    return updatedChallan;
  });
};

export const confirmChallan = async (id: string, userId: string) => {
  return await prisma.$transaction(async (tx) => {
    const challan = await tx.salesChallan.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!challan) {
      const error: AppError = new Error('Challan not found');
      error.statusCode = 404;
      error.errorCode = 'CHALLAN_NOT_FOUND';
      throw error;
    }

    if (challan.status !== 'DRAFT') {
      const error: AppError = new Error('Only DRAFT challans can be confirmed');
      error.statusCode = 400;
      error.errorCode = 'INVALID_CHALLAN_STATUS';
      throw error;
    }

    for (const item of challan.items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        const error: AppError = new Error(`Product ${item.skuSnapshot} no longer exists`);
        error.statusCode = 404;
        error.errorCode = 'PRODUCT_NOT_FOUND';
        throw error;
      }

      if (product.currentStock < item.quantity) {
        const error: AppError = new Error(
          `Insufficient stock for product '${product.productName}' (${product.sku}). Available: ${product.currentStock}, Required: ${item.quantity}`
        );
        error.statusCode = 400;
        error.errorCode = 'INSUFFICIENT_STOCK';
        throw error;
      }

      await tx.product.update({
        where: { id: product.id },
        data: {
          currentStock: product.currentStock - item.quantity,
        },
      });

      await tx.challanItem.update({
        where: { id: item.id },
        data: {
          productNameSnapshot: product.productName,
          skuSnapshot: product.sku,
          unitPriceSnapshot: product.unitPrice,
          subtotal: product.unitPrice * item.quantity,
        },
      });

      await tx.stockMovement.create({
        data: {
          productId: product.id,
          quantityChanged: -item.quantity,
          movementType: 'OUT',
          reason: `Sales Challan CONFIRMED: ${challan.challanNumber}`,
          createdBy: userId,
        },
      });
    }

    const finalItems = await tx.challanItem.findMany({
      where: { challanId: id },
    });
    const finalTotalQty = finalItems.reduce((acc, i) => acc + i.quantity, 0);

    const confirmedChallan = await tx.salesChallan.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        totalQuantity: finalTotalQty,
      },
      include: {
        items: true,
        customer: true,
      },
    });

    return confirmedChallan;
  });
};

export const cancelChallan = async (id: string, userId: string) => {
  return await prisma.$transaction(async (tx) => {
    const challan = await tx.salesChallan.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!challan) {
      const error: AppError = new Error('Challan not found');
      error.statusCode = 404;
      error.errorCode = 'CHALLAN_NOT_FOUND';
      throw error;
    }

    if (challan.status !== 'CONFIRMED') {
      const error: AppError = new Error('Only CONFIRMED challans can be cancelled');
      error.statusCode = 400;
      error.errorCode = 'INVALID_CHALLAN_STATUS';
      throw error;
    }

    for (const item of challan.items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (product) {
        await tx.product.update({
          where: { id: product.id },
          data: {
            currentStock: product.currentStock + item.quantity,
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: product.id,
            quantityChanged: item.quantity,
            movementType: 'IN',
            reason: `Sales Challan CANCELLED: ${challan.challanNumber}`,
            createdBy: userId,
          },
        });
      }
    }

    const cancelledChallan = await tx.salesChallan.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
      include: {
        items: true,
        customer: true,
      },
    });

    return cancelledChallan;
  });
};
