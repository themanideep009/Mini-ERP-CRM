import prisma from '../config/db.js';

// Auto-generate Challan Number: CH-YYYY-NNNN
const generateChallanNumber = async (tx) => {
  const currentYear = new Date().getFullYear();
  const prefix = `CH-${currentYear}-`;

  // Find the last challan created in this year
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

  // Format to 4-digit zero-padded number, e.g. 0001
  const seqStr = String(nextSeqNum).padStart(4, '0');
  return `${prefix}${seqStr}`;
};

export const getChallans = async (query = {}) => {
  const { status, page = 1, limit = 10 } = query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const where = {};
  if (status) {
    where.status = status;
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

export const getChallanById = async (id) => {
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
    const err = new Error(`Sales Challan with ID ${id} not found`);
    err.statusCode = 404;
    err.errorCode = 'CHALLAN_NOT_FOUND';
    throw err;
  }

  return challan;
};

export const createChallan = async (challanData, userId) => {
  const { customerId, items } = challanData;

  // Run in transaction to prevent concurrent race conditions in naming and stock snapshot checks
  return await prisma.$transaction(async (tx) => {
    // 1. Verify Customer
    const customer = await tx.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      const err = new Error('Customer not found');
      err.statusCode = 404;
      err.errorCode = 'CUSTOMER_NOT_FOUND';
      throw err;
    }

    // 2. Validate Items & Create Snapshot Data
    let totalQuantity = 0;
    const challanItemsData = [];

    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        const err = new Error(`Product with ID ${item.productId} not found`);
        err.statusCode = 404;
        err.errorCode = 'PRODUCT_NOT_FOUND';
        throw err;
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

    // 3. Generate Challan Number
    const challanNumber = await generateChallanNumber(tx);

    // 4. Create Draft Challan
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
      },
    });

    return newChallan;
  });
};

export const updateChallan = async (id, challanData, userId) => {
  const { items } = challanData;

  return await prisma.$transaction(async (tx) => {
    // 1. Fetch current challan
    const challan = await tx.salesChallan.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!challan) {
      const err = new Error('Challan not found');
      err.statusCode = 404;
      err.errorCode = 'CHALLAN_NOT_FOUND';
      throw err;
    }

    if (challan.status !== 'DRAFT') {
      const err = new Error('Only DRAFT challans can be updated');
      err.statusCode = 400;
      err.errorCode = 'INVALID_CHALLAN_STATUS';
      throw err;
    }

    // Delete existing items
    await tx.challanItem.deleteMany({
      where: { challanId: id },
    });

    // Re-create items and calculate totalQuantity
    let totalQuantity = 0;
    const challanItemsData = [];

    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        const err = new Error(`Product with ID ${item.productId} not found`);
        err.statusCode = 404;
        err.errorCode = 'PRODUCT_NOT_FOUND';
        throw err;
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

    // Update Challan
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
      },
    });

    return updatedChallan;
  });
};

export const confirmChallan = async (id, userId) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch challan
    const challan = await tx.salesChallan.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!challan) {
      const err = new Error('Challan not found');
      err.statusCode = 404;
      err.errorCode = 'CHALLAN_NOT_FOUND';
      throw err;
    }

    if (challan.status !== 'DRAFT') {
      const err = new Error('Only DRAFT challans can be confirmed');
      err.statusCode = 400;
      err.errorCode = 'INVALID_CHALLAN_STATUS';
      throw err;
    }

    // 2. Check stock availability for all items, and deduct stock
    for (const item of challan.items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        const err = new Error(`Product ${item.skuSnapshot} no longer exists`);
        err.statusCode = 404;
        err.errorCode = 'PRODUCT_NOT_FOUND';
        throw err;
      }

      if (product.currentStock < item.quantity) {
        const err = new Error(`Insufficient stock for product '${product.productName}' (${product.sku}). Available: ${product.currentStock}, Required: ${item.quantity}`);
        err.statusCode = 400;
        err.errorCode = 'INSUFFICIENT_STOCK';
        throw err;
      }

      // Deduct stock
      await tx.product.update({
        where: { id: product.id },
        data: {
          currentStock: product.currentStock - item.quantity,
        },
      });

      // Update snapshot details in challan item to reflect current details (just in case they changed)
      await tx.challanItem.update({
        where: { id: item.id },
        data: {
          productNameSnapshot: product.productName,
          skuSnapshot: product.sku,
          unitPriceSnapshot: product.unitPrice,
          subtotal: product.unitPrice * item.quantity,
        },
      });

      // Create stock movement record (OUT)
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

    // Calculate total quantity & amount based on current snaps
    const finalItems = await tx.challanItem.findMany({
      where: { challanId: id },
    });
    const finalTotalQty = finalItems.reduce((acc, i) => acc + i.quantity, 0);

    // 3. Update Challan status to CONFIRMED
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

export const cancelChallan = async (id, userId) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch challan
    const challan = await tx.salesChallan.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!challan) {
      const err = new Error('Challan not found');
      err.statusCode = 404;
      err.errorCode = 'CHALLAN_NOT_FOUND';
      throw err;
    }

    if (challan.status !== 'CONFIRMED') {
      const err = new Error('Only CONFIRMED challans can be cancelled');
      err.statusCode = 400;
      err.errorCode = 'INVALID_CHALLAN_STATUS';
      throw err;
    }

    // 2. Restore stock for all items
    for (const item of challan.items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (product) {
        // Increment stock back
        await tx.product.update({
          where: { id: product.id },
          data: {
            currentStock: product.currentStock + item.quantity,
          },
        });

        // Create stock movement record (IN)
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

    // 3. Update status to CANCELLED
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
