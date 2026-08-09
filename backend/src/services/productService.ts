import prisma from '../config/db.js';
import { Prisma } from '@prisma/client';
import { MovementType, PaginationQuery, StockMovementInput } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

export const getProducts = async (query: PaginationQuery) => {
  const { search, category, lowStock, page = 1, limit = 10 } = query;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));
  const skip = (pageNum - 1) * limitNum;

  const where: Prisma.ProductWhereInput = {};

  if (category) {
    where.category = { equals: category };
  }

  if (search) {
    where.OR = [
      { productName: { contains: search } },
      { sku: { contains: search } },
      { warehouseLocation: { contains: search } },
    ];
  }

  let products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  if (lowStock === 'true') {
    products = products.filter((p) => p.currentStock <= p.minimumStock);
  }

  const totalItems = products.length;
  const paginatedProducts = products.slice(skip, skip + limitNum);
  const totalPages = Math.ceil(totalItems / limitNum);

  return {
    products: paginatedProducts,
    meta: {
      totalItems,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
    },
  };
};

export const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      movements: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          creator: {
            select: { name: true, email: true },
          },
        },
      },
    },
  });

  if (!product) {
    const error: AppError = new Error(`Product with ID ${id} not found`);
    error.statusCode = 404;
    error.errorCode = 'PRODUCT_NOT_FOUND';
    throw error;
  }

  return product;
};

export const createProduct = async (data: {
  productName: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock?: number;
  minimumStock?: number;
  warehouseLocation: string;
}) => {
  const existingSku = await prisma.product.findUnique({
    where: { sku: data.sku },
  });

  if (existingSku) {
    const error: AppError = new Error(`Product with SKU '${data.sku}' already exists`);
    error.statusCode = 409;
    error.errorCode = 'DUPLICATE_SKU';
    throw error;
  }

  const product = await prisma.product.create({
    data: {
      productName: data.productName,
      sku: data.sku,
      category: data.category,
      unitPrice: data.unitPrice,
      currentStock: data.currentStock ?? 0,
      minimumStock: data.minimumStock ?? 0,
      warehouseLocation: data.warehouseLocation,
    },
  });

  // Create initial IN movement if currentStock > 0
  if (data.currentStock && data.currentStock > 0) {
    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        quantityChanged: data.currentStock,
        movementType: 'IN',
        reason: 'Initial stock entry on product creation',
      },
    });
  }

  return product;
};

export const updateProduct = async (
  id: string,
  data: Partial<{
    productName: string;
    sku: string;
    category: string;
    unitPrice: number;
    currentStock: number;
    minimumStock: number;
    warehouseLocation: string;
  }>
) => {
  const existingProduct = await prisma.product.findUnique({ where: { id } });

  if (!existingProduct) {
    const error: AppError = new Error(`Product with ID ${id} not found`);
    error.statusCode = 404;
    error.errorCode = 'PRODUCT_NOT_FOUND';
    throw error;
  }

  if (data.sku && data.sku !== existingProduct.sku) {
    const duplicate = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (duplicate) {
      const error: AppError = new Error(`Product with SKU '${data.sku}' already exists`);
      error.statusCode = 409;
      error.errorCode = 'DUPLICATE_SKU';
      throw error;
    }
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data,
  });

  return updatedProduct;
};

export const deleteProduct = async (id: string) => {
  const existingProduct = await prisma.product.findUnique({ where: { id } });

  if (!existingProduct) {
    const error: AppError = new Error(`Product with ID ${id} not found`);
    error.statusCode = 404;
    error.errorCode = 'PRODUCT_NOT_FOUND';
    throw error;
  }

  await prisma.product.delete({ where: { id } });
  return { message: 'Product deleted successfully' };
};

export const getStockMovementsByProduct = async (productId: string) => {
  await getProductById(productId);

  const movements = await prisma.stockMovement.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' },
    include: {
      creator: {
        select: { name: true, email: true },
      },
    },
  });

  return movements;
};

export const getAllStockMovements = async (query: PaginationQuery) => {
  const { page = 1, limit = 20 } = query;
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));
  const skip = (pageNum - 1) * limitNum;

  const [totalItems, movements] = await prisma.$transaction([
    prisma.stockMovement.count(),
    prisma.stockMovement.findMany({
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: { productName: true, sku: true },
        },
        creator: {
          select: { name: true, email: true },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limitNum);

  return {
    movements,
    meta: {
      totalItems,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
    },
  };
};

export const createStockMovement = async (input: StockMovementInput, userId: string) => {
  const { productId, quantityChanged, movementType, reason } = input;

  return await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: productId } });

    if (!product) {
      const error: AppError = new Error(`Product with ID ${productId} not found`);
      error.statusCode = 404;
      error.errorCode = 'PRODUCT_NOT_FOUND';
      throw error;
    }

    let newStock = product.currentStock;

    if (movementType === 'IN') {
      newStock += quantityChanged;
    } else if (movementType === 'OUT') {
      if (product.currentStock < quantityChanged) {
        const error: AppError = new Error(
          `Insufficient stock for '${product.productName}'. Current stock: ${product.currentStock}, Requested: ${quantityChanged}`
        );
        error.statusCode = 400;
        error.errorCode = 'INSUFFICIENT_STOCK';
        throw error;
      }
      newStock -= quantityChanged;
    }

    await tx.product.update({
      where: { id: productId },
      data: { currentStock: newStock },
    });

    const qtySigned = movementType === 'IN' ? quantityChanged : -quantityChanged;

    const movement = await tx.stockMovement.create({
      data: {
        productId,
        quantityChanged: qtySigned,
        movementType,
        reason,
        createdBy: userId,
      },
      include: {
        product: true,
        creator: {
          select: { name: true, email: true },
        },
      },
    });

    return movement;
  });
};
