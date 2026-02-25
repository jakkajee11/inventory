import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';

describe('Product CRUD E2E (T085)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  // Test data
  let authToken: string;
  let company: any;
  let category: any;
  let unit: any;

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
    category = setup.category;
    unit = setup.unit;
  });

  afterAll(async () => {
    await cleanupTestData(prisma);
    await app.close();
  });

  describe('POST /products', () => {
    it('should create new product successfully', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'TEST-001',
        barcode: '1234567890123',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 100.00,
        sellingPrice: 150.00,
        description: 'A test product',
        isActive: true,
      };

      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Product');
      expect(response.body.sku).toBe('TEST-001');
      expect(response.body.barcode).toBe('1234567890123');
      expect(response.body.purchasePrice).toBe(100.00);
      expect(response.body.sellingPrice).toBe(150.00);
      expect(response.body.isActive).toBe(true);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should require authentication', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'TEST-002',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 100.00,
      };

      const response = await request(app.getHttpServer())
        .post('/products')
        .send(productData)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should validate required fields', async () => {
      const productData = {
        // Missing required fields
      };

      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('name');
      expect(response.body.message).toContain('sku');
      expect(response.body.message).toContain('categoryId');
      expect(response.body.message).toContain('unitId');
      expect(response.body.message).toContain('purchasePrice');
    });

    it('should validate SKU uniqueness', async () => {
      const product1 = {
        name: 'Product 1',
        sku: 'UNIQUE-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 100.00,
      };

      // Create first product
      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(product1)
        .expect(201);

      // Try to create second product with same SKU
      const product2 = {
        name: 'Product 2',
        sku: 'UNIQUE-001', // Same SKU
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 200.00,
      };

      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(product2)
        .expect(409);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('SKU already exists');
    });

    it('should validate SKU format', async () => {
      const invalidSKUs = [
        '', // Empty
        '   ', // Whitespace only
        'A', // Too short
        'A'.repeat(51), // Too long
        'PRODUCT#001', // Invalid character
        'PRODUCT/001', // Invalid character
      ];

      for (const sku of invalidSKUs) {
        const productData = {
          name: 'Test Product',
          sku,
          categoryId: category.id,
          unitId: unit.id,
          purchasePrice: 100.00,
        };

        const response = await request(app.getHttpServer())
          .post('/products')
          .set('Authorization', `Bearer ${authToken}`)
          .send(productData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      }
    });

    it('should validate price format', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'TEST-003',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 'invalid-price', // Invalid format
        sellingPrice: 150.00,
      };

      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should validate category existence', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'TEST-004',
        categoryId: 'non-existent-category-id',
        unitId: unit.id,
        purchasePrice: 100.00,
      };

      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Category not found');
    });

    it('should validate unit existence', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'TEST-005',
        categoryId: category.id,
        unitId: 'non-existent-unit-id',
        purchasePrice: 100.00,
      };

      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Unit not found');
    });

    it('should normalize SKU before creation', async () => {
      const productData = {
        name: 'Test Product',
        sku: '  test-006  ', // Extra whitespace
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 100.00,
      };

      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(201);

      expect(response.body.sku).toBe('TEST-006'); // Should be normalized
    });

    it('should create product with optional fields', async () => {
      const productData = {
        name: 'Product with Optional Fields',
        sku: 'TEST-007',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 100.00,
        sellingPrice: 150.00,
        description: 'A detailed product description',
        barcode: '9876543210987',
        weight: 0.5,
        dimensions: { length: 10, width: 5, height: 2 },
        isActive: true,
      };

      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(201);

      expect(response.body.description).toBe('A detailed product description');
      expect(response.body.barcode).toBe('9876543210987');
      expect(response.body.weight).toBe(0.5);
      expect(response.body.dimensions).toEqual({ length: 10, width: 5, height: 2 });
      expect(response.body.isActive).toBe(true);
    });
  });

  describe('GET /products', () => {
    it('should list all products with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toHaveProperty('total');
      expect(response.body.meta).toHaveProperty('page');
      expect(response.body.meta).toHaveProperty('limit');
    });

    it('should filter products by name', async () => {
      // Create a product with specific name
      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Specific Product Name',
          sku: 'FILTER-001',
          categoryId: category.id,
          unitId: unit.id,
          purchasePrice: 100.00,
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ name: 'Specific Product Name' })
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.every(p => p.name.includes('Specific Product Name'))).toBe(true);
    });

    it('should filter products by category', async () => {
      const response = await request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ categoryId: category.id })
        .expect(200);

      expect(response.body.data.every(p => p.categoryId === category.id)).toBe(true);
    });

    it('should filter products by SKU', async () => {
      const response = await request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ sku: 'TEST-001' })
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].sku).toBe('TEST-001');
    });

    it('should filter products by active status', async () => {
      // Create an inactive product
      const inactiveResponse = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Inactive Product',
          sku: 'INACTIVE-001',
          categoryId: category.id,
          unitId: unit.id,
          purchasePrice: 100.00,
          isActive: false,
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ isActive: true })
        .expect(200);

      // Inactive product should not be in results
      expect(response.body.data.every(p => p.isActive !== false)).toBe(true);
    });

    it('should sort products by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ sortBy: 'name', sortOrder: 'asc' })
        .expect(200);

      const productNames = response.body.data.map(p => p.name);
      const sortedNames = [...productNames].sort((a, b) => a.localeCompare(b));
      expect(productNames).toEqual(sortedNames);
    });

    it('should sort products by created date', async () => {
      const response = await request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ sortBy: 'createdAt', sortOrder: 'desc' })
        .expect(200);

      const creationDates = response.body.data.map(p => new Date(p.createdAt).getTime());
      const sortedDates = [...creationDates].sort((a, b) => b - a);
      expect(creationDates).toEqual(sortedDates);
    });

    it('should handle search functionality', async () => {
      const response = await request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ search: 'Test' })
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.every(p =>
        p.name.includes('Test') ||
        p.description?.includes('Test') ||
        p.sku.includes('Test')
      )).toBe(true);
    });
  });

  describe('GET /products/:id', () => {
    let productId: string;

    beforeAll(async () => {
      // Create a product to test GET by ID
      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Get Test Product',
          sku: 'GET-001',
          categoryId: category.id,
          unitId: unit.id,
          purchasePrice: 100.00,
        });
      productId = response.body.id;
    });

    it('should get product by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(productId);
      expect(response.body.name).toBe('Get Test Product');
      expect(response.body.sku).toBe('GET-001');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app.getHttpServer())
        .get('/products/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PUT /products/:id', () => {
    let productId: string;

    beforeAll(async () => {
      // Create a product to test update
      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Update Test Product',
          sku: 'UPDATE-001',
          categoryId: category.id,
          unitId: unit.id,
          purchasePrice: 100.00,
        });
      productId = response.body.id;
    });

    it('should update product successfully', async () => {
      const updateData = {
        name: 'Updated Product Name',
        purchasePrice: 120.00,
        sellingPrice: 180.00,
        description: 'Updated description',
      };

      const response = await request(app.getHttpServer())
        .put(`/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe('Updated Product Name');
      expect(response.body.purchasePrice).toBe(120.00);
      expect(response.body.sellingPrice).toBe(180.00);
      expect(response.body.description).toBe('Updated description');
    });

    it('should validate SKU uniqueness on update', async () => {
      // Create another product
      const otherProductResponse = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Other Product',
          sku: 'OTHER-001',
          categoryId: category.id,
          unitId: unit.id,
          purchasePrice: 200.00,
        });
      const otherProductId = otherProductResponse.body.id;

      // Try to update first product to use other product's SKU
      const updateData = {
        sku: 'OTHER-001',
      };

      const response = await request(app.getHttpServer())
        .put(`/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(409);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('SKU already exists');
    });

    it('should allow SKU update if same product', async () => {
      const updateData = {
        sku: 'UPDATE-001', // Same SKU
      };

      const response = await request(app.getHttpServer())
        .put(`/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.sku).toBe('UPDATE-001');
    });

    it('should return 404 for non-existent product', async () => {
      const updateData = {
        name: 'Updated Name',
      };

      const response = await request(app.getHttpServer())
        .put('/products/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle partial updates', async () => {
      const updateData = {
        sellingPrice: 200.00,
        isActive: false,
      };

      const response = await request(app.getHttpServer())
        .put(`/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.sellingPrice).toBe(200.00);
      expect(response.body.isActive).toBe(false);
      // Other fields should remain unchanged
      expect(response.body.name).toBe('Updated Product Name');
    });
  });

  describe('DELETE /products/:id', () => {
    let productId: string;

    beforeAll(async () => {
      // Create a product to test delete
      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Delete Test Product',
          sku: 'DELETE-001',
          categoryId: category.id,
          unitId: unit.id,
          purchasePrice: 100.00,
        });
      productId = response.body.id;
    });

    it('should delete product successfully', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Product deleted successfully');

      // Verify product is deleted
      await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app.getHttpServer())
        .delete('/products/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });

    it('should prevent deletion of product with stock', async () => {
      // Create product
      const productResponse = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Stock Product',
          sku: 'STOCK-001',
          categoryId: category.id,
          unitId: unit.id,
          purchasePrice: 100.00,
        });
      const stockProductId = productResponse.body.id;

      // Create warehouse
      const warehouse = await prisma.warehouse.create({
        data: {
          name: 'Test Warehouse',
          code: 'WH001',
          companyId: company.id,
          isActive: true,
        },
      });

      // Create stock for product
      await prisma.stock.create({
        data: {
          productId: stockProductId,
          warehouseId: warehouse.id,
          quantity: 10,
        },
      });

      // Try to delete product with stock - should fail
      const response = await request(app.getHttpServer())
        .delete(`/products/${stockProductId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Cannot delete product with existing stock');
    });
  });

  describe('Batch operations', () => {
    let productIds: string[] = [];

    beforeAll(async () => {
      // Create multiple products for batch operations
      for (let i = 0; i < 3; i++) {
        const response = await request(app.getHttpServer())
          .post('/products')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: `Batch Product ${i}`,
            sku: `BATCH-${i}`,
            categoryId: category.id,
            unitId: unit.id,
            purchasePrice: 100.00 + i,
          });
        productIds.push(response.body.id);
      }
    });

    it('should get multiple products by IDs', async () => {
      const response = await request(app.getHttpServer())
        .get('/products/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ ids: productIds.join(',') })
        .expect(200);

      expect(response.body.data.length).toBe(3);
      expect(response.body.data.every(p => productIds.includes(p.id))).toBe(true);
    });

    it('should handle invalid product IDs in batch request', async () => {
      const response = await request(app.getHttpServer())
        .get('/products/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ ids: 'valid-id,invalid-id,another-valid-id' })
        .expect(200);

      // Should return valid products and filter out invalid ones
      expect(Array.isArray(response.body.data)).toBe(true);
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
    category,
    unit,
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