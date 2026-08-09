import prisma from '../config/db.js';
import { Role } from '../types/index.js';

export const getDashboardMetrics = async (userRole: Role) => {
  const [
    totalCustomers,
    totalProducts,
    allProducts,
    totalChallans,
    confirmedChallans,
    draftChallans,
    recentChallans,
    recentMovements,
    activeCustomersCount,
    leadCustomersCount,
    inactiveCustomersCount,
  ] = await prisma.$transaction([
    prisma.customer.count(),
    prisma.product.count(),
    prisma.product.findMany({
      select: {
        id: true,
        productName: true,
        sku: true,
        currentStock: true,
        minimumStock: true,
        unitPrice: true,
      },
    }),
    prisma.salesChallan.count(),
    prisma.salesChallan.count({ where: { status: 'CONFIRMED' } }),
    prisma.salesChallan.count({ where: { status: 'DRAFT' } }),
    prisma.salesChallan.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { customerName: true, businessName: true } },
      },
    }),
    prisma.stockMovement.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { productName: true, sku: true } },
      },
    }),
    prisma.customer.count({ where: { status: 'ACTIVE' } }),
    prisma.customer.count({ where: { status: 'LEAD' } }),
    prisma.customer.count({ where: { status: 'INACTIVE' } }),
  ]);

  const totalStock = allProducts.reduce((sum, p) => sum + p.currentStock, 0);
  const lowStockProducts = allProducts.filter((p) => p.currentStock <= p.minimumStock);
  const totalInventoryValue = allProducts.reduce((sum, p) => sum + p.currentStock * p.unitPrice, 0);

  return {
    role: userRole,
    summary: {
      totalCustomers,
      totalProducts,
      totalStock,
      lowStockCount: lowStockProducts.length,
      totalChallans,
      confirmedChallans,
      draftChallans,
      totalInventoryValue,
    },
    lowStockProductsList: lowStockProducts,
    recentChallans,
    recentMovements,
    customerDistribution: {
      ACTIVE: activeCustomersCount,
      LEAD: leadCustomersCount,
      INACTIVE: inactiveCustomersCount,
    },
  };
};
