import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SAMPLE_CATEGORIES = [
  { name: 'Electronics', description: 'Electronic devices and components' },
  { name: 'Office Supplies', description: 'General office supplies' },
  { name: 'Furniture', description: 'Office and warehouse furniture' },
  { name: 'Packaging', description: 'Packaging materials' },
];

const SAMPLE_UNITS = [
  { name: 'Piece', abbreviation: 'pc' },
  { name: 'Box', abbreviation: 'bx' },
  { name: 'Set', abbreviation: 'set' },
  { name: 'Kilogram', abbreviation: 'kg' },
];

const SAMPLE_PRODUCTS = [
  { sku: 'ELEC-001', name: 'Wireless Mouse', category: 'Electronics', unit: 'Piece', costPrice: 15.00, sellingPrice: 25.00, minStock: 10, currentStock: 45 },
  { sku: 'ELEC-002', name: 'USB Keyboard', category: 'Electronics', unit: 'Piece', costPrice: 25.00, sellingPrice: 45.00, minStock: 10, currentStock: 30 },
  { sku: 'ELEC-003', name: 'HDMI Cable 2m', category: 'Electronics', unit: 'Piece', costPrice: 5.00, sellingPrice: 12.00, minStock: 20, currentStock: 8 },
  { sku: 'ELEC-004', name: 'USB-C Hub 7-port', category: 'Electronics', unit: 'Piece', costPrice: 35.00, sellingPrice: 59.00, minStock: 5, currentStock: 0 },
  { sku: 'ELEC-005', name: 'Webcam HD 1080p', category: 'Electronics', unit: 'Piece', costPrice: 45.00, sellingPrice: 79.00, minStock: 5, currentStock: 12 },
  { sku: 'OFF-001', name: 'A4 Paper (500 sheets)', category: 'Office Supplies', unit: 'Box', costPrice: 8.00, sellingPrice: 15.00, minStock: 15, currentStock: 50 },
  { sku: 'OFF-002', name: 'Ballpoint Pens (12pk)', category: 'Office Supplies', unit: 'Set', costPrice: 4.00, sellingPrice: 8.00, minStock: 20, currentStock: 35 },
  { sku: 'OFF-003', name: 'Sticky Notes Pack', category: 'Office Supplies', unit: 'Set', costPrice: 3.00, sellingPrice: 6.00, minStock: 25, currentStock: 60 },
  { sku: 'OFF-004', name: 'Desk Organizer', category: 'Office Supplies', unit: 'Piece', costPrice: 12.00, sellingPrice: 22.00, minStock: 8, currentStock: 15 },
  { sku: 'OFF-005', name: 'File Folders (100pk)', category: 'Office Supplies', unit: 'Box', costPrice: 15.00, sellingPrice: 28.00, minStock: 10, currentStock: 22 },
  { sku: 'FUR-001', name: 'Office Chair Basic', category: 'Furniture', unit: 'Piece', costPrice: 120.00, sellingPrice: 199.00, minStock: 3, currentStock: 8 },
  { sku: 'FUR-002', name: 'Standing Desk', category: 'Furniture', unit: 'Piece', costPrice: 350.00, sellingPrice: 599.00, minStock: 2, currentStock: 5 },
  { sku: 'FUR-003', name: 'Filing Cabinet 3-Drawer', category: 'Furniture', unit: 'Piece', costPrice: 180.00, sellingPrice: 299.00, minStock: 2, currentStock: 3 },
  { sku: 'FUR-004', name: 'Bookshelf 5-Tier', category: 'Furniture', unit: 'Piece', costPrice: 85.00, sellingPrice: 149.00, minStock: 3, currentStock: 6 },
  { sku: 'PKG-001', name: 'Cardboard Box Small', category: 'Packaging', unit: 'Piece', costPrice: 1.50, sellingPrice: 3.00, minStock: 100, currentStock: 250 },
  { sku: 'PKG-002', name: 'Cardboard Box Medium', category: 'Packaging', unit: 'Piece', costPrice: 2.50, sellingPrice: 5.00, minStock: 80, currentStock: 180 },
  { sku: 'PKG-003', name: 'Bubble Wrap Roll 50m', category: 'Packaging', unit: 'Piece', costPrice: 25.00, sellingPrice: 45.00, minStock: 10, currentStock: 28 },
  { sku: 'PKG-004', name: 'Packing Tape (36 rolls)', category: 'Packaging', unit: 'Box', costPrice: 35.00, sellingPrice: 65.00, minStock: 5, currentStock: 12 },
  { sku: 'PKG-005', name: 'Foam Peanuts 1kg', category: 'Packaging', unit: 'Kilogram', costPrice: 4.00, sellingPrice: 8.00, minStock: 20, currentStock: 45 },
];

async function main() {
  console.log('Starting product seed...');

  // Get the first company
  const company = await prisma.company.findFirst();
  if (!company) {
    throw new Error('No company found. Please run the main seed first.');
  }
  console.log(`Using company: ${company.name}`);

  // Get the default warehouse
  const warehouse = await prisma.warehouse.findFirst({
    where: { companyId: company.id, isDefault: true },
  });
  if (!warehouse) {
    throw new Error('No default warehouse found.');
  }
  console.log(`Using warehouse: ${warehouse.name}`);

  // Get admin user for stock movements
  const adminUser = await prisma.user.findFirst({
    where: { companyId: company.id },
  });
  if (!adminUser) {
    throw new Error('No user found.');
  }

  // Create categories
  console.log('Creating categories...');
  const categoryMap = new Map<string, string>();
  for (const cat of SAMPLE_CATEGORIES) {
    const category = await prisma.category.upsert({
      where: {
        companyId_name: {
          companyId: company.id,
          name: cat.name,
        },
      },
      update: { description: cat.description },
      create: {
        companyId: company.id,
        name: cat.name,
        description: cat.description,
      },
    });
    categoryMap.set(cat.name, category.id);
    console.log(`  Created category: ${cat.name}`);
  }

  // Create units
  console.log('Creating units...');
  const unitMap = new Map<string, string>();
  for (const u of SAMPLE_UNITS) {
    // Check if unit exists
    let unit = await prisma.unit.findFirst({
      where: { companyId: company.id, name: u.name },
    });

    if (!unit) {
      unit = await prisma.unit.create({
        data: {
          companyId: company.id,
          name: u.name,
          abbreviation: u.abbreviation,
        },
      });
    }
    unitMap.set(u.name, unit.id);
    console.log(`  Created unit: ${u.name}`);
  }

  // Create products
  console.log('Creating products...');
  for (const prod of SAMPLE_PRODUCTS) {
    const categoryId = categoryMap.get(prod.category);
    const unitId = unitMap.get(prod.unit);

    if (!categoryId || !unitId) {
      console.log(`  Skipping ${prod.name} - missing category or unit`);
      continue;
    }

    const product = await prisma.product.upsert({
      where: {
        companyId_sku: {
          companyId: company.id,
          sku: prod.sku,
        },
      },
      update: {
        name: prod.name,
        categoryId,
        unitId,
        costPrice: prod.costPrice,
        sellingPrice: prod.sellingPrice,
        minStock: prod.minStock,
        currentStock: prod.currentStock,
        averageCost: prod.costPrice,
      },
      create: {
        companyId: company.id,
        sku: prod.sku,
        name: prod.name,
        categoryId,
        unitId,
        costPrice: prod.costPrice,
        sellingPrice: prod.sellingPrice,
        minStock: prod.minStock,
        currentStock: prod.currentStock,
        averageCost: prod.costPrice,
      },
    });
    console.log(`  Created product: ${prod.sku} - ${prod.name} (stock: ${prod.currentStock})`);

    // Create stock movements for products with stock
    if (prod.currentStock > 0) {
      // Create a goods receipt movement
      const receiptNumber = `GR-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      await prisma.stockMovement.create({
        data: {
          companyId: company.id,
          productId: product.id,
          warehouseId: warehouse.id,
          type: 'IN',
          quantity: prod.currentStock,
          unitCost: prod.costPrice,
          balanceAfter: prod.currentStock,
          averageCostAfter: prod.costPrice,
          referenceType: 'GOODS_RECEIPT',
          referenceId: `seed-${Date.now()}`,
          referenceNo: receiptNumber,
          userId: adminUser.id,
        },
      });
    }
  }

  // Create some additional stock movements for activity
  console.log('Creating stock movements...');
  const products = await prisma.product.findMany({
    where: { companyId: company.id },
    take: 5,
  });

  for (let i = 0; i < 10; i++) {
    const product = products[Math.floor(Math.random() * products.length)];
    if (!product) continue;

    const isIn = Math.random() > 0.5;
    const quantity = Math.floor(Math.random() * 10) + 1;
    const daysAgo = Math.floor(Math.random() * 30);
    const movementDate = new Date();
    movementDate.setDate(movementDate.getDate() - daysAgo);

    const currentStock = product.currentStock;
    const newStock = isIn ? currentStock + quantity : Math.max(0, currentStock - quantity);
    const refNumber = isIn
      ? `GR-${movementDate.getTime()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
      : `GI-${movementDate.getTime()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    await prisma.stockMovement.create({
      data: {
        companyId: company.id,
        productId: product.id,
        warehouseId: warehouse.id,
        type: isIn ? 'IN' : 'OUT',
        quantity: isIn ? quantity : -quantity,
        unitCost: Number(product.averageCost),
        balanceAfter: newStock,
        averageCostAfter: Number(product.averageCost),
        referenceType: isIn ? 'GOODS_RECEIPT' : 'GOODS_ISSUE',
        referenceId: `seed-activity-${i}`,
        referenceNo: refNumber,
        userId: adminUser.id,
        createdAt: movementDate,
      },
    });

    // Update product stock
    await prisma.product.update({
      where: { id: product.id },
      data: { currentStock: newStock },
    });
  }

  console.log('Product seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
