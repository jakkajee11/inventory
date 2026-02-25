import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';

describe('Inventory E2E (T109)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  // Test data
  let authToken: string;
  let company: any;
  let warehouse: any;
  let category: any;
  let unit: any;
  let product: any;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    prisma = moduleRef.get<PrismaService>(PrismaService);
    jwtService = moduleRef.get<JwtService>(JwtService);

    // Setup test data
    const setup = await setupTestData(prisma, jwtService);
    authToken = setup.authToken;
    company = setup.company;
    warehouse = setup.warehouse;
    category = setup.category;
    unit = setup.unit;
    product = setup.product;
  });

  afterAll(async () => {
    await cleanupTestData(prisma);
    await app.close();
  });

  describe('GET /inventory/stock', () => {
    it('should get current stock levels', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory/stock')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('meta');
    });

    it('should filter stock by warehouse', async () => {
      const response = await request(app.getHttpServer())
        .get(`/inventory/stock?warehouseId=${warehouse.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.every(s => s.warehouseId === warehouse.id)).toBe(true);
    });

    it('should filter stock by product category', async () => {
      const response = await request(app.getHttpServer())
        .get(`/inventory/stock?categoryId=${category.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.every(s => s.categoryId === category.id)).toBe(true);
    });

    it('should filter stock by low stock status', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory/stock?isLowStock=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Filter should return products with low stock
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter stock by zero stock status', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory/stock?isZeroStock=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should paginate stock results', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory/stock?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(10);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
    });

    it('should search stock by product name or SKU', async () => {
      const response = await request(app.getHttpServer())
        .get(`/inventory/stock?search=${product.name}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.every(s =>
        s.product.name.includes(product.name) ||
        s.product.sku.includes(product.sku)
      )).toBe(true);
    });

    it('should sort stock by quantity', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory/stock?sortBy=quantity&sortOrder=desc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const quantities = response.body.data.map(s => s.quantity);
      const sortedQuantities = [...quantities].sort((a, b) => b - a);
      expect(quantities).toEqual(sortedQuantities);
    });

    it('should require authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory/stock')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /inventory/stock/:productId', () => {
    it('should get stock for specific product', async () => {
      const response = await request(app.getHttpServer())
        .get(`/inventory/stock/${product.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('productId');
      expect(response.body.productId).toBe(product.id);
      expect(response.body).toHaveProperty('totalQuantity');
      expect(response.body).toHaveProperty('breakdown');
      expect(Array.isArray(response.body.breakdown)).toBe(true);
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory/stock/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /inventory/movements', () => {
    it('should get stock movements', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory/movements')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('meta');
    });

    it('should filter movements by type', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory/movements?type=GOODS_RECEIPT')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.every(m => m.type === 'GOODS_RECEIPT')).toBe(true);
    });

    it('should filter movements by date range', async () => {
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const response = await request(app.getHttpServer())
        .get(`/inventory/movements?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter movements by product', async () => {
      const response = await request(app.getHttpServer())
        .get(`/inventory/movements?productId=${product.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.every(m => m.productId === product.id)).toBe(true);
    });

    it('should filter movements by warehouse', async () => {
      const response = await request(app.getHttpServer())
        .get(`/inventory/movements?warehouseId=${warehouse.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.every(m => m.warehouseId === warehouse.id)).toBe(true);
    });

    it('should paginate movements', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory/movements?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(response.body.meta.page).toBe(1);
    });
  });

  describe('POST /inventory/adjustments', () => {
    it('should create stock adjustment', async () => {
      const adjustmentData = {
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: -10, // Reduce stock
        reason: 'Stock count adjustment',
        notes: 'Physical count showed less stock than system',
      };

      const response = await request(app.getHttpServer())
        .post('/inventory/adjustments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(adjustmentData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.productId).toBe(product.id);
      expect(response.body.warehouseId).toBe(warehouse.id);
      expect(response.body.quantity).toBe(-10);
      expect(response.body.status).toBe('PENDING');
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should validate required fields', async () => {
      const adjustmentData = {
        // Missing required fields
      };

      const response = await request(app.getHttpServer())
        .post('/inventory/adjustments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(adjustmentData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('productId');
      expect(response.body.message).toContain('warehouseId');
      expect(response.body.message).toContain('quantity');
    });

    it('should validate adjustment quantity', async () => {
      const adjustmentData = {
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 0, // Zero quantity
        reason: 'Invalid adjustment',
      };

      const response = await request(app.getHttpServer())
        .post('/inventory/adjustments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(adjustmentData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should require authentication', async () => {
      const adjustmentData = {
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 10,
        reason: 'Stock adjustment',
      };

      const response = await request(app.getHttpServer())
        .post('/inventory/adjustments')
        .send(adjustmentData)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should create adjustment with notes', async () => {
      const adjustmentData = {
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 5,
        reason: 'Add stock',
        notes: 'Received additional inventory from supplier',
      };

      const response = await request(app.getHttpServer())
        .post('/inventory/adjustments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(adjustmentData)
        .expect(201);

      expect(response.body.notes).toBe('Received additional inventory from supplier');
    });
  });

  describe('PUT /inventory/adjustments/:id/approve', () => {
    let adjustmentId: string;

    beforeAll(async () => {
      // Create adjustment to approve
      const response = await request(app.getHttpServer())
        .post('/inventory/adjustments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: product.id,
          warehouseId: warehouse.id,
          quantity: -5,
          reason: 'Stock count adjustment',
        });
      adjustmentId = response.body.id;
    });

    it('should approve pending adjustment', async () => {
      const response = await request(app.getHttpServer())
        .put(`/inventory/adjustments/${adjustmentId}/approve`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('APPROVED');
      expect(response.body).toHaveProperty('approvedBy');
      expect(response.body).toHaveProperty('approvedAt');
    });

    it('should return 404 for non-existent adjustment', async () => {
      const response = await request(app.getHttpServer())
        .put('/inventory/adjustments/non-existent-id/approve')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject already approved adjustment', async () => {
      // First approval
      await request(app.getHttpServer())
        .put(`/inventory/adjustments/${adjustmentId}/approve`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Try to approve again - should fail
      const response = await request(app.getHttpServer())
        .put(`/inventory/adjustments/${adjustmentId}/approve`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('already approved');
    });
  });

  describe('PUT /inventory/adjustments/:id/reject', () => {
    let adjustmentId: string;

    beforeAll(async () => {
      // Create adjustment to reject
      const response = await request(app.getHttpServer())
        .post('/inventory/adjustments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: product.id,
          warehouseId: warehouse.id,
          quantity: -10,
          reason: 'Stock count adjustment',
        });
      adjustmentId = response.body.id;
    });

    it('should reject pending adjustment', async () => {
      const response = await request(app.getHttpServer())
        .put(`/inventory/adjustments/${adjustmentId}/reject`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ reason: 'Incorrect count' })
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('REJECTED');
      expect(response.body).toHaveProperty('rejectionReason');
      expect(response.body.rejectionReason).toBe('Incorrect count');
    });

    it('should require rejection reason', async () => {
      const response = await request(app.getHttpServer())
        .put(`/inventory/adjustments/${adjustmentId}/reject`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('reason');
    });
  });

  describe('GET /inventory/reports', () => {
    it('should get stock valuation report', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory/reports/valuation')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data[0]).toHaveProperty('productId');
      expect(response.body.data[0]).toHaveProperty('totalValue');
    });

    it('should get stock turnover report', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory/reports/turnover')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get aging report', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory/reports/aging')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should export inventory report', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory/reports/export')
        .query({ format: 'csv' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
    });
  });

  describe('GET /inventory/dashboard', () => {
    it('should get inventory dashboard summary', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalProducts');
      expect(response.body).toHaveProperty('totalValue');
      expect(response.body).toHaveProperty('lowStockCount');
      expect(response.body).toHaveProperty('zeroStockCount');
      expect(response.body).toHaveProperty('movementsToday');
    });

    it('should get dashboard metrics by warehouse', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory/dashboard')
        .query({ warehouseId: warehouse.id })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('warehouseStock');
      expect(Array.isArray(response.body.warehouseStock)).toBe(true);
    });
  });

  describe('Inventory alerts', () => {
    it('should get low stock alerts', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory/alerts/low-stock')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get zero stock alerts', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory/alerts/zero-stock')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get expiring stock alerts', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory/alerts/expiring')
        .query({ days: 30 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Bulk operations', () => {
    it('should update multiple stock levels', async () => {
      const updateData = [
        {
          productId: product.id,
          warehouseId: warehouse.id,
          quantity: 50,
        },
      ];

      const response = await request(app.getHttpServer())
        .post('/inventory/stock/bulk-update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ updates: updateData })
        .expect(200);

      expect(response.body).toHaveProperty('processed');
      expect(response.body.processed).toBe(1);
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('should validate bulk update data', async () => {
      const updateData = [
        {
          // Missing required fields
        },
      ];

      const response = await request(app.getHttpServer())
        .post('/inventory/stock/bulk-update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ updates: updateData })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });
});

// Helper functions
async function setupTestData(prisma: PrismaService, jwtService: JwtService) {
  // Create company
  const company = await prisma.company.create({
    data: {
      name: 'Test Company',
      taxId: 'TEST123',
      currency: 'THB',
      timezone: 'Asia/Bangkok',
    },
  });

  // Create warehouse
  const warehouse = await prisma.warehouse.create({
    data: {
      name: 'Test Warehouse',
      code: 'WH001',
      companyId: company.id,
      isActive: true,
    },
  });

  // Create admin role
  const role = await prisma.role.create({
    data: {
      name: 'ADMIN',
      isSystem: true,
    },
  });

  // Create admin user
  const user = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      passwordHash: '$2b$10$testHash',
      name: 'Admin User',
      companyId: company.id,
      roleId: role.id,
      isActive: true,
    },
  });

  // Create category
  const category = await prisma.category.create({
    data: {
      name: 'Test Category',
      code: 'CAT001',
      companyId: company.id,
    },
  });

  // Create unit
  const unit = await prisma.unit.create({
    data: {
      name: 'Piece',
      code: 'PC',
      companyId: company.id,
    },
  });

  // Create product
  const product = await prisma.product.create({
    data: {
      name: 'Test Product',
      sku: 'TEST-001',
      barcode: '1234567890123',
      categoryId: category.id,
      unitId: unit.id,
      purchasePrice: 100.00,
      sellingPrice: 150.00,
      isActive: true,
    },
  });

  // Create initial stock
  await prisma.stock.create({
    data: {
      productId: product.id,
      warehouseId: warehouse.id,
      quantity: 100,
    },
  });

  // Generate JWT token
  const token = jwtService.sign({
    sub: user.id,
    email: user.email,
    roles: ['ADMIN'],
    companyId: company.id,
  });

  return {
    authToken: token,
    company,
    warehouse,
    category,
    unit,
    product,
  };
}

async function cleanupTestData(prisma: PrismaService) {
  // Clean up test data
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['admin@test.com'],
      },
    },
  });

  await prisma.role.deleteMany({
    where: {
      name: 'ADMIN',
    },
  });

  await prisma.company.deleteMany({
    where: {
      name: 'Test Company',
    },
  });
}