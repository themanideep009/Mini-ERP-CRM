import prisma from '../config/db.js';
import { successResponse } from '../utils/responses.js';

export const getStats = async (req, res, next) => {
  try {
    // 1. Fetch counts in parallel
    const [
      totalCustomers,
      totalProducts,
      totalChallans,
      confirmedChallans,
      draftChallans,
      cancelledChallans,
    ] = await prisma.$transaction([
      prisma.customer.count(),
      prisma.product.count(),
      prisma.salesChallan.count(),
      prisma.salesChallan.count({ where: { status: 'CONFIRMED' } }),
      prisma.salesChallan.count({ where: { status: 'DRAFT' } }),
      prisma.salesChallan.count({ where: { status: 'CANCELLED' } }),
    ]);

    // 2. Fetch all products to aggregate total stock and low stock warnings
    const products = await prisma.product.findMany({
      select: {
        id: true,
        productName: true,
        sku: true,
        currentStock: true,
        minimumStock: true,
      },
    });

    let totalStock = 0;
    const lowStockProductsList = [];

    products.forEach((p) => {
      totalStock += p.currentStock;
      if (p.currentStock <= p.minimumStock) {
        lowStockProductsList.push({
          id: p.id,
          productName: p.productName,
          sku: p.sku,
          currentStock: p.currentStock,
          minimumStock: p.minimumStock,
        });
      }
    });

    // 3. Customer Status Distribution
    const statusCounts = await prisma.customer.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });
    const customerStatusDistribution = statusCounts.map((item) => ({
      status: item.status,
      count: item._count.id,
    }));

    // 4. Customer Type Distribution
    const typeCounts = await prisma.customer.groupBy({
      by: ['customerType'],
      _count: {
        id: true,
      },
    });
    const customerTypeDistribution = typeCounts.map((item) => ({
      type: item.customerType,
      count: item._count.id,
    }));

    // 5. Recent Challans (Last 5)
    const recentChallans = await prisma.salesChallan.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            customerName: true,
            businessName: true,
          },
        },
      },
    });

    // 6. Recent Stock Movements (Last 5)
    const recentStockMovements = await prisma.stockMovement.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            productName: true,
            sku: true,
          },
        },
      },
    });

    // 7. Monthly Sales Trend (Confirmed Challans - Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const confirmedChallansList = await prisma.salesChallan.findMany({
      where: {
        status: 'CONFIRMED',
        createdAt: { gte: sixMonthsAgo },
      },
      include: {
        items: true,
      },
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const salesByMonth = {};

    // Initialize labels for the last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      salesByMonth[label] = 0;
    }

    confirmedChallansList.forEach((challan) => {
      const d = new Date(challan.createdAt);
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      if (salesByMonth[label] !== undefined) {
        const challanAmount = challan.items.reduce((sum, item) => sum + item.subtotal, 0);
        salesByMonth[label] += challanAmount;
      }
    });

    const salesTrend = Object.keys(salesByMonth).map((key) => ({
      month: key,
      amount: salesByMonth[key],
    }));

    // 8. Top Selling Products (by quantity)
    const confirmedItems = await prisma.challanItem.findMany({
      where: {
        challan: {
          status: 'CONFIRMED',
        },
      },
      select: {
        productId: true,
        productNameSnapshot: true,
        skuSnapshot: true,
        quantity: true,
        subtotal: true,
      },
    });

    const productSales = {};
    confirmedItems.forEach((item) => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = {
          productId: item.productId,
          productName: item.productNameSnapshot,
          sku: item.skuSnapshot,
          quantity: 0,
          revenue: 0,
        };
      }
      productSales[item.productId].quantity += item.quantity;
      productSales[item.productId].revenue += item.subtotal;
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Compile Stats Package
    const stats = {
      summary: {
        totalCustomers,
        totalProducts,
        totalStock,
        lowStockAlerts: lowStockProductsList.length,
        totalChallans,
        confirmedChallans,
        draftChallans,
        cancelledChallans,
      },
      lowStockProducts: lowStockProductsList.slice(0, 5),
      customerStatusDistribution,
      customerTypeDistribution,
      recentChallans,
      recentStockMovements,
      salesTrend,
      topProducts,
    };

    return successResponse(res, 200, 'Dashboard statistics fetched successfully', stats);
  } catch (error) {
    next(error);
  }
};
