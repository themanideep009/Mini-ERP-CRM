import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with rich sample data...\n');

  // ─── CLEAN ────────────────────────────────────────────────────
  await prisma.challanItem.deleteMany({});
  await prisma.salesChallan.deleteMany({});
  await prisma.stockMovement.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.user.deleteMany({});

  // ─── USERS ────────────────────────────────────────────────────
  const hash = await bcrypt.hash('password123', 10);

  const [admin, sales, sales2, warehouse, accounts] = await Promise.all([
    prisma.user.create({ data: { name: 'Arjun Mehta',        email: 'admin@example.com',     password: hash, role: 'ADMIN'     } }),
    prisma.user.create({ data: { name: 'Sneha Kapoor',       email: 'sales@example.com',     password: hash, role: 'SALES'     } }),
    prisma.user.create({ data: { name: 'Rohan Verma',        email: 'sales2@example.com',    password: hash, role: 'SALES'     } }),
    prisma.user.create({ data: { name: 'Dinesh Rawat',       email: 'warehouse@example.com', password: hash, role: 'WAREHOUSE' } }),
    prisma.user.create({ data: { name: 'Kavya Nair',         email: 'accounts@example.com',  password: hash, role: 'ACCOUNTS'  } }),
  ]);
  console.log('✅ Users created');

  // ─── CUSTOMERS ────────────────────────────────────────────────
  const [c1, c2, c3, c4, c5, c6, c7, c8] = await Promise.all([
    prisma.customer.create({ data: {
      customerName: 'Aman Sharma', mobile: '9876543210', email: 'aman.sharma@sharmaelectronics.com',
      businessName: 'Sharma Electronics & Retail', gstNumber: '07AAAAA1111A1Z1',
      customerType: 'RETAIL', address: 'Shop No. 12, Lajpat Nagar, New Delhi - 110024',
      status: 'ACTIVE', followUpDate: new Date('2026-08-20'),
      notes: 'Repeat buyer. Interested in premium speakers and smart gadgets. Pays within 15 days.',
    }}),
    prisma.customer.create({ data: {
      customerName: 'Rajesh Gupta', mobile: '9811223344', email: 'rajesh@guptawholesalers.com',
      businessName: 'Gupta Wholesale Distributors', gstNumber: '08BBBBB2222B2Z2',
      customerType: 'WHOLESALE', address: '456 Grain Market, Jaipur, Rajasthan - 302001',
      status: 'ACTIVE', followUpDate: new Date('2026-08-25'),
      notes: 'Bulk orders every month. Negotiated 5% volume discount on orders above 50 units.',
    }}),
    prisma.customer.create({ data: {
      customerName: 'Priya Patel', mobile: '9900998877', email: 'priya@patellogistics.com',
      businessName: 'Patel Logistics & Distribution', gstNumber: '24CCCCC3333C3Z3',
      customerType: 'DISTRIBUTOR', address: 'Plot 78, GIDC Industrial Estate, Ahmedabad - 380015',
      status: 'ACTIVE', followUpDate: new Date('2026-09-01'),
      notes: 'Pan-India distributor. Handles Rajasthan, Gujarat, MP zones. High potential account.',
    }}),
    prisma.customer.create({ data: {
      customerName: 'Vikram Singh', mobile: '9555123456', email: 'vikram@singhstore.in',
      businessName: 'Singh General Stores', gstNumber: '03DDDDD4444D4Z4',
      customerType: 'RETAIL', address: 'Mall Road, Amritsar, Punjab - 143001',
      status: 'INACTIVE', followUpDate: null,
      notes: 'Lost contact. Last order was in March 2026. May have switched to competitor.',
    }}),
    prisma.customer.create({ data: {
      customerName: 'Meera Nambiar', mobile: '9443256789', email: 'meera@nambiartrading.com',
      businessName: 'Nambiar Trading Co.', gstNumber: '32EEEEE5555E5Z5',
      customerType: 'WHOLESALE', address: 'MG Road, Kochi, Kerala - 682016',
      status: 'LEAD', followUpDate: new Date('2026-08-12'),
      notes: 'Attended trade fair. Showed interest in fitness bands & smart watches. Demo pending.',
    }}),
    prisma.customer.create({ data: {
      customerName: 'Suresh Bansal', mobile: '9312345678', email: 'suresh@bansalenterprise.com',
      businessName: 'Bansal Enterprise Pvt. Ltd.', gstNumber: '09FFFFF6666F6Z6',
      customerType: 'DISTRIBUTOR', address: '88 Industrial Area, Noida, UP - 201301',
      status: 'ACTIVE', followUpDate: new Date('2026-09-05'),
      notes: 'Long-term client since 2021. Handles UP & Bihar distribution. Credit limit: ₹5L.',
    }}),
    prisma.customer.create({ data: {
      customerName: 'Divya Iyer', mobile: '9821012345', email: 'divya@iyerelectricals.com',
      businessName: 'Iyer Electricals & Hardware', gstNumber: '33GGGGG7777G7Z7',
      customerType: 'RETAIL', address: '23 T. Nagar, Chennai, Tamil Nadu - 600017',
      status: 'LEAD', followUpDate: new Date('2026-08-15'),
      notes: 'Referred by Rajesh Gupta. Looking for LED bulbs and MCB switches in bulk.',
    }}),
    prisma.customer.create({ data: {
      customerName: 'Harpreet Kaur', mobile: '9988776655', email: 'harpreet@kaurtrades.com',
      businessName: 'Kaur Trades & Supplies', gstNumber: '03HHHHH8888H8Z8',
      customerType: 'WHOLESALE', address: 'Bazar Street, Ludhiana, Punjab - 141001',
      status: 'ACTIVE', followUpDate: new Date('2026-08-30'),
      notes: 'New wholesale account. First order placed. Potential to become top 5 customer.',
    }}),
  ]);
  console.log('✅ Customers created (8)');

  // ─── PRODUCTS ─────────────────────────────────────────────────
  const [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10] = await Promise.all([
    prisma.product.create({ data: { productName: 'Dynamic Wireless Bluetooth Speaker',   sku: 'SKU-SPK-001',  category: 'Electronics',  unitPrice: 1499.00,  currentStock: 95,  minimumStock: 20, warehouseLocation: 'Shelf A-3' }}),
    prisma.product.create({ data: { productName: 'Smart LED Bulb 12W (Warm White)',       sku: 'SKU-LED-002',  category: 'Electricals',  unitPrice: 319.00,   currentStock: 480, minimumStock: 50, warehouseLocation: 'Shelf B-1' }}),
    prisma.product.create({ data: { productName: 'Noise Cancelling Over-Ear Headphones', sku: 'SKU-HDP-003',  category: 'Electronics',  unitPrice: 3499.00,  currentStock: 8,   minimumStock: 15, warehouseLocation: 'Shelf A-5' }}),
    prisma.product.create({ data: { productName: 'Smart Fitness Band Pro v5',            sku: 'SKU-BND-004',  category: 'Gadgets',      unitPrice: 2199.00,  currentStock: 110, minimumStock: 30, warehouseLocation: 'Shelf C-2' }}),
    prisma.product.create({ data: { productName: 'Mechanical Gaming Keyboard RGB',       sku: 'SKU-KBD-005',  category: 'Peripherals',  unitPrice: 2999.00,  currentStock: 42,  minimumStock: 10, warehouseLocation: 'Shelf D-1' }}),
    prisma.product.create({ data: { productName: 'USB-C 65W GaN Fast Charger',           sku: 'SKU-CHG-006',  category: 'Accessories',  unitPrice: 849.00,   currentStock: 6,   minimumStock: 25, warehouseLocation: 'Shelf B-4' }}),
    prisma.product.create({ data: { productName: 'Smart 4K UHD Android TV 43 inch',      sku: 'SKU-TV4-007',  category: 'Electronics',  unitPrice: 28999.00, currentStock: 18,  minimumStock: 5,  warehouseLocation: 'Rack E-1'  }}),
    prisma.product.create({ data: { productName: 'Industrial MCB Switch 32A',            sku: 'SKU-MCB-008',  category: 'Electricals',  unitPrice: 189.00,   currentStock: 320, minimumStock: 100,warehouseLocation: 'Shelf B-2' }}),
    prisma.product.create({ data: { productName: 'Portable Power Bank 20000mAh',         sku: 'SKU-PBK-009',  category: 'Accessories',  unitPrice: 1299.00,  currentStock: 3,   minimumStock: 20, warehouseLocation: 'Shelf C-5' }}),
    prisma.product.create({ data: { productName: 'Smart IP Security Camera 2MP',         sku: 'SKU-CAM-010',  category: 'Security',     unitPrice: 2499.00,  currentStock: 55,  minimumStock: 10, warehouseLocation: 'Shelf F-1' }}),
  ]);
  console.log('✅ Products created (10)');

  // ─── STOCK MOVEMENTS (History) ────────────────────────────────
  await prisma.stockMovement.createMany({ data: [
    // Opening stock
    { productId: p1.id,  quantityChanged: 100, movementType: 'IN',  reason: 'Opening Stock — June 2026',                   createdBy: admin.id },
    { productId: p2.id,  quantityChanged: 500, movementType: 'IN',  reason: 'Opening Stock — June 2026',                   createdBy: admin.id },
    { productId: p3.id,  quantityChanged: 30,  movementType: 'IN',  reason: 'Opening Stock — June 2026',                   createdBy: admin.id },
    { productId: p4.id,  quantityChanged: 120, movementType: 'IN',  reason: 'Opening Stock — June 2026',                   createdBy: admin.id },
    { productId: p5.id,  quantityChanged: 50,  movementType: 'IN',  reason: 'Opening Stock — June 2026',                   createdBy: admin.id },
    { productId: p6.id,  quantityChanged: 30,  movementType: 'IN',  reason: 'Opening Stock — June 2026',                   createdBy: admin.id },
    { productId: p7.id,  quantityChanged: 20,  movementType: 'IN',  reason: 'Opening Stock — June 2026',                   createdBy: admin.id },
    { productId: p8.id,  quantityChanged: 400, movementType: 'IN',  reason: 'Opening Stock — June 2026',                   createdBy: admin.id },
    { productId: p9.id,  quantityChanged: 25,  movementType: 'IN',  reason: 'Opening Stock — June 2026',                   createdBy: admin.id },
    { productId: p10.id, quantityChanged: 60,  movementType: 'IN',  reason: 'Opening Stock — June 2026',                   createdBy: admin.id },
    // Purchase replenishments
    { productId: p2.id,  quantityChanged: 200, movementType: 'IN',  reason: 'Purchase — Invoice PO-2026-0112 (Supplier: Wipro Lighting)', createdBy: warehouse.id },
    { productId: p8.id,  quantityChanged: 100, movementType: 'IN',  reason: 'Purchase — Invoice PO-2026-0115 (Supplier: Havells)', createdBy: warehouse.id },
    { productId: p1.id,  quantityChanged: 20,  movementType: 'IN',  reason: 'Purchase — Invoice PO-2026-0118 (Supplier: boAt Audio)', createdBy: warehouse.id },
    // Manual OUT adjustments
    { productId: p3.id,  quantityChanged: -12, movementType: 'OUT', reason: 'Damaged goods write-off — QC rejected batch',   createdBy: warehouse.id },
    { productId: p5.id,  quantityChanged: -8,  movementType: 'OUT', reason: 'Sales Challan CONFIRMED: CH-2026-0003',         createdBy: sales.id },
    { productId: p6.id,  quantityChanged: -24, movementType: 'OUT', reason: 'Sales Challan CONFIRMED: CH-2026-0002',         createdBy: sales.id },
    { productId: p1.id,  quantityChanged: -15, movementType: 'OUT', reason: 'Sales Challan CONFIRMED: CH-2026-0002',         createdBy: sales.id },
    { productId: p4.id,  quantityChanged: -10, movementType: 'OUT', reason: 'Sales Challan CONFIRMED: CH-2026-0001',         createdBy: sales.id },
    { productId: p9.id,  quantityChanged: -22, movementType: 'OUT', reason: 'Sales Challan CONFIRMED: CH-2026-0004',         createdBy: sales2.id },
    { productId: p2.id,  quantityChanged: -20, movementType: 'OUT', reason: 'Sales Challan CONFIRMED: CH-2026-0004',         createdBy: sales2.id },
    { productId: p10.id, quantityChanged: -5,  movementType: 'OUT', reason: 'Transfer to branch warehouse — Mumbai',        createdBy: warehouse.id },
    { productId: p7.id,  quantityChanged: -2,  movementType: 'OUT', reason: 'Sales Challan CONFIRMED: CH-2026-0005',         createdBy: admin.id },
    { productId: p6.id,  quantityChanged: 15,  movementType: 'IN',  reason: 'Return from customer — CH-2026-0002 partial cancellation', createdBy: warehouse.id },
  ]});
  console.log('✅ Stock movements created (23)');

  // ─── SALES CHALLANS ───────────────────────────────────────────

  // CH-2026-0001: CONFIRMED — Gupta Wholesale
  await prisma.salesChallan.create({ data: {
    challanNumber: 'CH-2026-0001', customerId: c2.id,
    totalQuantity: 25, status: 'CONFIRMED', createdBy: sales.id,
    items: { create: [
      { productId: p4.id, productNameSnapshot: p4.productName, skuSnapshot: p4.sku, unitPriceSnapshot: 2199, quantity: 10, subtotal: 21990 },
      { productId: p1.id, productNameSnapshot: p1.productName, skuSnapshot: p1.sku, unitPriceSnapshot: 1499, quantity: 8,  subtotal: 11992 },
      { productId: p2.id, productNameSnapshot: p2.productName, skuSnapshot: p2.sku, unitPriceSnapshot: 319,  quantity: 7,  subtotal: 2233  },
    ]},
  }});

  // CH-2026-0002: CONFIRMED — Bansal Enterprise
  await prisma.salesChallan.create({ data: {
    challanNumber: 'CH-2026-0002', customerId: c6.id,
    totalQuantity: 39, status: 'CONFIRMED', createdBy: sales.id,
    items: { create: [
      { productId: p1.id,  productNameSnapshot: p1.productName,  skuSnapshot: p1.sku,  unitPriceSnapshot: 1499, quantity: 15, subtotal: 22485 },
      { productId: p6.id,  productNameSnapshot: p6.productName,  skuSnapshot: p6.sku,  unitPriceSnapshot: 849,  quantity: 24, subtotal: 20376 },
    ]},
  }});

  // CH-2026-0003: CONFIRMED — Sharma Electronics
  await prisma.salesChallan.create({ data: {
    challanNumber: 'CH-2026-0003', customerId: c1.id,
    totalQuantity: 10, status: 'CONFIRMED', createdBy: sales2.id,
    items: { create: [
      { productId: p5.id, productNameSnapshot: p5.productName, skuSnapshot: p5.sku, unitPriceSnapshot: 2999, quantity: 5, subtotal: 14995 },
      { productId: p3.id, productNameSnapshot: p3.productName, skuSnapshot: p3.sku, unitPriceSnapshot: 3499, quantity: 2, subtotal: 6998  },
      { productId: p10.id,productNameSnapshot: p10.productName,skuSnapshot: p10.sku,unitPriceSnapshot: 2499, quantity: 3, subtotal: 7497  },
    ]},
  }});

  // CH-2026-0004: CONFIRMED — Kaur Trades
  await prisma.salesChallan.create({ data: {
    challanNumber: 'CH-2026-0004', customerId: c8.id,
    totalQuantity: 42, status: 'CONFIRMED', createdBy: sales2.id,
    items: { create: [
      { productId: p9.id, productNameSnapshot: p9.productName, skuSnapshot: p9.sku, unitPriceSnapshot: 1299, quantity: 22, subtotal: 28578 },
      { productId: p2.id, productNameSnapshot: p2.productName, skuSnapshot: p2.sku, unitPriceSnapshot: 319,  quantity: 20, subtotal: 6380  },
    ]},
  }});

  // CH-2026-0005: CONFIRMED — Patel Logistics
  await prisma.salesChallan.create({ data: {
    challanNumber: 'CH-2026-0005', customerId: c3.id,
    totalQuantity: 7, status: 'CONFIRMED', createdBy: admin.id,
    items: { create: [
      { productId: p7.id, productNameSnapshot: p7.productName, skuSnapshot: p7.sku, unitPriceSnapshot: 28999, quantity: 2, subtotal: 57998 },
      { productId: p10.id,productNameSnapshot: p10.productName,skuSnapshot: p10.sku,unitPriceSnapshot: 2499,  quantity: 5, subtotal: 12495 },
    ]},
  }});

  // CH-2026-0006: DRAFT — Nambiar Trading (new lead)
  await prisma.salesChallan.create({ data: {
    challanNumber: 'CH-2026-0006', customerId: c5.id,
    totalQuantity: 15, status: 'DRAFT', createdBy: sales.id,
    items: { create: [
      { productId: p4.id, productNameSnapshot: p4.productName, skuSnapshot: p4.sku, unitPriceSnapshot: 2199, quantity: 10, subtotal: 21990 },
      { productId: p1.id, productNameSnapshot: p1.productName, skuSnapshot: p1.sku, unitPriceSnapshot: 1499, quantity: 5,  subtotal: 7495  },
    ]},
  }});

  // CH-2026-0007: DRAFT — Iyer Electricals (LED order)
  await prisma.salesChallan.create({ data: {
    challanNumber: 'CH-2026-0007', customerId: c7.id,
    totalQuantity: 100, status: 'DRAFT', createdBy: sales2.id,
    items: { create: [
      { productId: p2.id, productNameSnapshot: p2.productName, skuSnapshot: p2.sku, unitPriceSnapshot: 319, quantity: 60, subtotal: 19140 },
      { productId: p8.id, productNameSnapshot: p8.productName, skuSnapshot: p8.sku, unitPriceSnapshot: 189, quantity: 40, subtotal: 7560  },
    ]},
  }});

  // CH-2026-0008: CANCELLED — Singh Store (couldn't fulfill)
  await prisma.salesChallan.create({ data: {
    challanNumber: 'CH-2026-0008', customerId: c4.id,
    totalQuantity: 5, status: 'CANCELLED', createdBy: sales.id,
    items: { create: [
      { productId: p3.id, productNameSnapshot: p3.productName, skuSnapshot: p3.sku, unitPriceSnapshot: 3499, quantity: 3, subtotal: 10497 },
      { productId: p9.id, productNameSnapshot: p9.productName, skuSnapshot: p9.sku, unitPriceSnapshot: 1299, quantity: 2, subtotal: 2598  },
    ]},
  }});

  console.log('✅ Sales challans created (8)');
  console.log('\n════════════════════════════════════════════');
  console.log('🎉 Seeding completed successfully!');
  console.log('════════════════════════════════════════════');
  console.log('\n📋 Demo Login Accounts:');
  console.log('   admin@example.com     → ADMIN     (password123)');
  console.log('   sales@example.com     → SALES     (password123)');
  console.log('   warehouse@example.com → WAREHOUSE (password123)');
  console.log('   accounts@example.com  → ACCOUNTS  (password123)');
  console.log('   sales2@example.com    → SALES     (password123)');
  console.log('\n📦 Sample Data:');
  console.log('   8 Customers (ACTIVE / LEAD / INACTIVE)');
  console.log('   10 Products (3 with Low Stock alerts)');
  console.log('   23 Stock Movements (IN / OUT logs)');
  console.log('   8 Sales Challans (CONFIRMED / DRAFT / CANCELLED)');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
