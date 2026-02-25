import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Test data seed for E2E tests
 *
 * This script creates predictable test data that E2E tests can rely on.
 * It creates products, categories, and other test entities.
 */
async function main() {
  console.log('🧹 Cleaning up existing test data...');

  // Clean up existing test data
  await prisma.goodsReceipt.deleteMany({
    where: {
      receiptNumber: {
        startsWith: 'TEST-GR-'
      }
    }
  });

  await prisma.goodsIssue.deleteMany({
    where: {
      issueNumber: {
        startsWith: 'TEST-GI-'
      }
    }
  });

  await prisma.stockAdjustment.deleteMany({
    where: {
      adjustmentNumber: {
        startsWith: 'TEST-SA-'
      }
    }
  });

  await prisma.product.deleteMany({
    where: {
      OR: [
        { name: { startsWith: 'Test Product' } },
        { name: { startsWith: 'Low Stock Product' } },
        { name: { startsWith: 'Concurrent Product' } },
        { name: { startsWith: 'Adjustment Product' } }
      ]
    }
  });

  console.log('✅ Test data cleaned');

  // Create test categories
  console.log('📁 Creating test categories...');
  const categories = [
    { name: 'Electronics', description: 'Electronic devices and components' },
    { name: 'Office Supplies', description: 'Office stationery and supplies' },
    { name: 'Furniture', description: 'Office furniture and equipment' }
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category
    });
  }

  // Create test units
  console.log('📏 Creating test units...');
  const units = [
    { name: 'Piece', code: 'PC' },
    { name: 'Box', code: 'BX' },
    { name: 'Set', code: 'ST' },
    { name: 'Kilogram', code: 'KG' }
  ];

  for (const unit of units) {
    await prisma.unit.upsert({
      where: { code: unit.code },
      update: {},
      create: unit
    });
  }

  // Create test products
  console.log('📦 Creating test products...');
  const testProducts = [
    {
      name: 'Test Product',
      sku: 'TEST-001',
      description: 'A test product for E2E testing',
      categoryId: (await prisma.category.findFirst({ where: { name: 'Electronics' } }))!.id,
      unitId: (await prisma.unit.findFirst({ where: { code: 'PC' } }))!.id,
      purchasePrice: 100,
      sellingPrice: 120,
      minStock: 10,
      isActive: true
    },
    {
      name: 'Test Product 2',
      sku: 'TEST-002',
      description: 'Second test product',
      categoryId: (await prisma.category.findFirst({ where: { name: 'Office Supplies' } }))!.id,
      unitId: (await prisma.unit.findFirst({ where: { code: 'BX' } }))!.id,
      purchasePrice: 50,
      sellingPrice: 60,
      minStock: 5,
      isActive: true
    },
    {
      name: 'Test Product 3',
      sku: 'TEST-003',
      description: 'Third test product',
      categoryId: (await prisma.category.findFirst({ where: { name: 'Furniture' } }))!.id,
      unitId: (await prisma.unit.findFirst({ where: { code: 'ST' } }))!.id,
      purchasePrice: 25,
      sellingPrice: 30,
      minStock: 3,
      isActive: true
    },
    {
      name: 'Low Stock Product',
      sku: 'LOW-001',
      description: 'Product for testing low stock alerts',
      categoryId: (await prisma.category.findFirst({ where: { name: 'Office Supplies' } }))!.id,
      unitId: (await prisma.unit.findFirst({ where: { code: 'PC' } }))!.id,
      purchasePrice: 75,
      sellingPrice: 90,
      minStock: 10,
      isActive: true
    },
    {
      name: 'Concurrent Product',
      sku: 'CON-001',
      description: 'Product for testing concurrent operations',
      categoryId: (await prisma.category.findFirst({ where: { name: 'Electronics' } }))!.id,
      unitId: (await prisma.unit.findFirst({ where: { code: 'PC' } }))!.id,
      purchasePrice: 50,
      sellingPrice: 60,
      minStock: 5,
      isActive: true
    },
    {
      name: 'Adjustment Product',
      sku: 'ADJ-001',
      description: 'Product for testing stock adjustments',
      categoryId: (await prisma.category.findFirst({ where: { name: 'Furniture' } }))!.id,
      unitId: (await prisma.unit.findFirst({ where: { code: 'ST' } }))!.id,
      purchasePrice: 100,
      sellingPrice: 120,
      minStock: 10,
      isActive: true
    }
  ];

  for (const product of testProducts) {
    await prisma.product.create({
      data: product
    });
  }

  console.log('✅ Test products created');

  // Get the default warehouse
  const warehouse = await prisma.warehouse.findFirst({
    where: { isDefault: true }
  });

  if (!warehouse) {
    throw new Error('Default warehouse not found');
  }

  // Create test suppliers
  console.log('🏢 Creating test suppliers...');
  const suppliers = [
    { name: 'Test Supplier', contactEmail: 'supplier@test.com', contactPhone: '1234567890' },
    { name: 'Open Inventory Inc.', contactEmail: 'info@open-inventory.app', contactPhone: '0987654321' }
  ];

  for (const supplier of suppliers) {
    await prisma.supplier.create({
      data: {
        ...supplier,
        companyId: (await prisma.company.findFirst())!.id,
        warehouseId: warehouse.id
      }
    });
  }

  console.log('✅ Test data seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Test data seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });