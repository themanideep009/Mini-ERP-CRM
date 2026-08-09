import prisma from '../config/db.js';

export const getProducts = async (query = {}) => {
  const { search = '', category = '', page = 1, limit = 10 } = query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const where = {};

  if (search) {
    where.OR = [
      { productName: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (category) {
    where.category = category;
  }

  const [totalItems, products] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limitNum);

  return {
    products,
    meta: {
      totalItems,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
    },
  };
};

export const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    const err = new Error(`Product with ID ${id} not found`);
    err.statusCode = 404;
    err.errorCode = 'PRODUCT_NOT_FOUND';
    throw err;
  }

  return product;
};

export const createProduct = async (productData, userId = null) => {
  const { productName, sku, category, unitPrice, currentStock = 0, minimumStock = 0, warehouseLocation } = productData;

  // Let's wrap product creation and initial stock movement in a transaction if stock > 0
  return await prisma.$transaction(async (tx) => {
    const newProduct = await tx.product.create({
      data: {
        productName,
        sku,
        category,
        unitPrice,
        currentStock,
        minimumStock,
        warehouseLocation,
      },
    });

    if (currentStock > 0) {
      await tx.stockMovement.create({
        data: {
          productId: newProduct.id,
          quantityChanged: currentStock,
          movementType: 'IN',
          reason: 'Initial Product Import/Creation Stock',
          createdBy: userId || null, // null allowed since createdBy is optional
        },
      });
    }

    return newProduct;
  });
};

export const updateProduct = async (id, productData) => {
  await getProductById(id);

  return await prisma.product.update({
    where: { id },
    data: productData,
  });
};

export const deleteProduct = async (id) => {
  await getProductById(id);

  // Check if product is referenced in challans
  const associatedChallans = await prisma.challanItem.count({
    where: { productId: id },
  });

  if (associatedChallans > 0) {
    const err = new Error('Cannot delete product referenced in historical sales challans');
    err.statusCode = 400;
    err.errorCode = 'PRODUCT_HAS_CHALLAN_REFS';
    throw err;
  }

  return await prisma.product.delete({
    where: { id },
  });
};

export const getStockMovementsByProductId = async (productId) => {
  await getProductById(productId);

  return await prisma.stockMovement.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' },
  });
};

export const createStockMovement = async (movementData, userId) => {
  const { productId, quantityChanged, movementType, reason } = movementData;
  const quantity = Math.abs(quantityChanged);

  return await prisma.$transaction(async (tx) => {
    // 1. Fetch current product
    const product = await tx.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      const err = new Error(`Product with ID ${productId} not found`);
      err.statusCode = 404;
      err.errorCode = 'PRODUCT_NOT_FOUND';
      throw err;
    }

    let newStock = product.currentStock;
    let netChange = 0;

    if (movementType === 'OUT') {
      if (product.currentStock < quantity) {
        const err = new Error(`Insufficient stock for ${product.productName}. Available: ${product.currentStock}, Requested: ${quantity}`);
        err.statusCode = 400;
        err.errorCode = 'INSUFFICIENT_STOCK';
        throw err;
      }
      newStock -= quantity;
      netChange = -quantity;
    } else {
      newStock += quantity;
      netChange = quantity;
    }

    // 2. Update product stock
    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: { currentStock: newStock },
    });

    // 3. Create stock movement record
    const movement = await tx.stockMovement.create({
      data: {
        productId,
        quantityChanged: netChange,
        movementType,
        reason,
        createdBy: userId,
      },
    });

    return {
      movement,
      product: updatedProduct,
    };
  });
};
