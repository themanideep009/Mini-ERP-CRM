import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clean existing data (order is important due to constraints)
  await prisma.challanItem.deleteMany({});
  await prisma.salesChallan.deleteMany({});
  await prisma.stockMovement.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@example.com',
      password: passwordHash,
      role: 'ADMIN',
    },
  });

  const sales = await prisma.user.create({
    data: {
      name: 'Sales Executive',
      email: 'sales@example.com',
      password: passwordHash,
      role: 'SALES',
    },
  });

  const warehouse = await prisma.user.create({
    data: {
      name: 'Warehouse Operator',
      email: 'warehouse@example.com',
      password: passwordHash,
      role: 'WAREHOUSE',
    },
  });

  const accounts = await prisma.user.create({
    data: {
      name: 'Accounts Officer',
      email: 'accounts@example.com',
      password: passwordHash,
      role: 'ACCOUNTS',
    },
  });

  console.log('Created Users:', { admin: admin.email, sales: sales.email, warehouse: warehouse.email, accounts: accounts.email });

  // 3. Create Customers
  const customer1 = await prisma.customer.create({
    data: {
      customerName: 'Aman Sharma',
      mobile: '9876543210',
      email: 'aman.sharma@example.com',
      businessName: 'Sharma Electronics & Retail',
      gstNumber: '07AAAAA1111A1Z1',
      customerType: 'RETAIL',
      address: 'Shop No. 12, Lajpat Nagar, New Delhi - 110024',
      status: 'ACTIVE',
      followUpDate: new Date('2026-08-15'),
      notes: 'Interested in buying premium dynamic speakers.',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      customerName: 'Rajesh Gupta',
      mobile: '9811223344',
      email: 'rajesh@guptawholesalers.com',
      businessName: 'Gupta Wholesale Distributors',
      gstNumber: '08BBBBB2222B2Z2',
      customerType: 'WHOLESALE',
      address: '456 Grain Market, Jaipur, Rajasthan - 302001',
      status: 'ACTIVE',
      followUpDate: new Date('2026-08-20'),
      notes: 'Requires bulk pricing for lighting products.',
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      customerName: 'Priya Patel',
      mobile: '9900998877',
      email: 'priya@patelenterprises.com',
      businessName: 'Patel Logistics & Distribution',
      gstNumber: '24CCCCC3333C3Z3',
      customerType: 'DISTRIBUTOR',
      address: 'Plot 78, GIDC Industrial Estate, Ahmedabad - 380015',
      status: 'LEAD',
      followUpDate: new Date('2026-08-10'),
      notes: 'Initial discussion done. Sent quotation for smart watches.',
    },
  });

  const customer4 = await prisma.customer.create({
    data: {
      customerName: 'Vikram Singh',
      mobile: '9555123456',
      email: 'vikram@singhstore.com',
      businessName: 'Singh General Store',
      gstNumber: '03DDDDD4444D4Z4',
      customerType: 'RETAIL',
      address: 'Mall Road, Amritsar, Punjab - 143001',
      status: 'INACTIVE',
      followUpDate: null,
      notes: 'Not reachable for the past 2 months.',
    },
  });

  console.log('Created Customers');

  // 4. Create Products
  const prod1 = await prisma.product.create({
    data: {
      productName: 'Dynamic Wireless Bluetooth Speaker',
      sku: 'PROD-SPK-001',
      category: 'Electronics',
      unitPrice: 1500.0,
      currentStock: 100,
      minimumStock: 15,
      warehouseLocation: 'Shelf A-3',
    },
  });

  const prod2 = await prisma.product.create({
    data: {
      productName: 'Smart LED Bulb 12W',
      sku: 'PROD-LED-002',
      category: 'Electricals',
      unitPrice: 320.0,
      currentStock: 250,
      minimumStock: 40,
      warehouseLocation: 'Shelf B-1',
    },
  });

  const prod3 = await prisma.product.create({
    data: {
      productName: 'Noise Cancelling Headphones',
      sku: 'PROD-HDPH-003',
      category: 'Electronics',
      unitPrice: 3500.0,
      currentStock: 10,  // Low stock!
      minimumStock: 20,
      warehouseLocation: 'Shelf A-5',
    },
  });

  const prod4 = await prisma.product.create({
    data: {
      productName: 'Smart Fitness Band v5',
      sku: 'PROD-BAND-004',
      category: 'Gadgets',
      unitPrice: 2200.0,
      currentStock: 120,
      minimumStock: 25,
      warehouseLocation: 'Shelf C-2',
    },
  });

  console.log('Created Products');

  // 5. Create Initial Stock Movements for products (IN movements)
  await prisma.stockMovement.createMany({
    data: [
      {
        productId: prod1.id,
        quantityChanged: 100,
        movementType: 'IN',
        reason: 'Initial Opening Stock',
        createdBy: admin.id,
      },
      {
        productId: prod2.id,
        quantityChanged: 250,
        movementType: 'IN',
        reason: 'Initial Opening Stock',
        createdBy: admin.id,
      },
      {
        productId: prod3.id,
        quantityChanged: 10,
        movementType: 'IN',
        reason: 'Initial Opening Stock',
        createdBy: admin.id,
      },
      {
        productId: prod4.id,
        quantityChanged: 120,
        movementType: 'IN',
        reason: 'Initial Opening Stock',
        createdBy: admin.id,
      },
    ],
  });

  console.log('Created Stock Movements');

  // 6. Create Sales Challans
  // Challan 1: Draft Challan
  const challanDraft = await prisma.salesChallan.create({
    data: {
      challanNumber: 'CH-2026-0001',
      customerId: customer1.id,
      totalQuantity: 5,
      status: 'DRAFT',
      createdBy: sales.id,
      items: {
        create: [
          {
            productId: prod1.id,
            productNameSnapshot: prod1.productName,
            skuSnapshot: prod1.sku,
            unitPriceSnapshot: prod1.unitPrice,
            quantity: 2,
            subtotal: prod1.unitPrice * 2,
          },
          {
            productId: prod2.id,
            productNameSnapshot: prod2.productName,
            skuSnapshot: prod2.sku,
            unitPriceSnapshot: prod2.unitPrice,
            quantity: 3,
            subtotal: prod2.unitPrice * 3,
          },
        ],
      },
    },
  });

  // Challan 2: Confirmed Challan (Must reduce stock of products in actual system, but since it is seed data, we will deduct stock manually for seed)
  // Let's deduct stock for items in confirmed challan:
  // prod1: 5 units (stock goes from 100 to 95)
  // prod4: 10 units (stock goes from 120 to 110)
  const challanConfirmed = await prisma.salesChallan.create({
    data: {
      challanNumber: 'CH-2026-0002',
      customerId: customer2.id,
      totalQuantity: 15,
      status: 'CONFIRMED',
      createdBy: sales.id,
      items: {
        create: [
          {
            productId: prod1.id,
            productNameSnapshot: prod1.productName,
            skuSnapshot: prod1.sku,
            unitPriceSnapshot: prod1.unitPrice,
            quantity: 5,
            subtotal: prod1.unitPrice * 5,
          },
          {
            productId: prod4.id,
            productNameSnapshot: prod4.productName,
            skuSnapshot: prod4.sku,
            unitPriceSnapshot: prod4.unitPrice,
            quantity: 10,
            subtotal: prod4.unitPrice * 10,
          },
        ],
      },
    },
  });

  // Update product stock manually in database seed to match the confirmed status
  await prisma.product.update({
    where: { id: prod1.id },
    data: { currentStock: 95 },
  });
  await prisma.product.update({
    where: { id: prod4.id },
    data: { currentStock: 110 },
  });

  // Create OUT stock movements for confirmed challan
  await prisma.stockMovement.createMany({
    data: [
      {
        productId: prod1.id,
        quantityChanged: -5,
        movementType: 'OUT',
        reason: 'Sales Challan CONFIRMED: CH-2026-0002',
        createdBy: sales.id,
      },
      {
        productId: prod4.id,
        quantityChanged: -10,
        movementType: 'OUT',
        reason: 'Sales Challan CONFIRMED: CH-2026-0002',
        createdBy: sales.id,
      },
    ],
  });

  console.log('Created Sales Challans & Deducted Stock');
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
