import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestHelper } from '../utils/test-helper';
import { ProductService } from '../src/modules/product/product.service';
import { ConflictException, BadRequestException } from '@nestjs/common';

describe('SKU Uniqueness Validation (T082)', () => {
  let testHelper: TestHelper;
  let productService: ProductService;

  beforeEach(async () => {
    testHelper = new TestHelper();
    await testHelper.createTestingModule();

    const module = await testHelper.createTestingModule();
    productService = module.get<ProductService>(ProductService);
  });

  afterEach(async () => {
    await testHelper.cleanup();
  });

  describe('SKU validation rules', () => {
    it('should accept valid SKU format', async () => {
      const company = await testHelper.createTestCompany();
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      const validSKUs = [
        'PROD-001',
        'PROD-002',
        'PROD-2024-001',
        'PRD-001',
        'PRD123',
        'ABC123XYZ',
        'ITEM-001',
      ];

      for (const sku of validSKUs) {
        const productData = {
          name: 'Test Product',
          sku,
          categoryId: category.id,
          unitId: unit.id,
          purchasePrice: 100,
          sellingPrice: 150,
        };

        // Should not throw error for valid SKU format
        expect(() => validateSKUFormat(sku)).not.toThrow();
      }
    });

    it('should reject invalid SKU formats', () => {
      const invalidSKUs = [
        '', // Empty string
        '   ', // Whitespace only
        'PRODUCT#001', // Contains special character
        'PRODUCT/001', // Contains special character
        'PRODUCT@001', // Contains special character
        'PRODUCT$001', // Contains special character
        'PRODUCT%001', // Contains special character
        'PRODUCT&001', // Contains special character
        'PRODUCT*001', // Contains special character
        'PRODUCT(001', // Contains special character
        'PRODUCT)001', // Contains special character
        'PRODUCT=001', // Contains special character
        'PRODUCT+001', // Contains special character
        'PRODUCT-001-', // Ends with hyphen
        '-PRODUCT-001', // Starts with hyphen
        '12345', // Only numbers
        'ABC', // Only letters
        'A1', // Too short
        'A'.repeat(51), // Too long (max 50 characters)
      ];

      for (const sku of invalidSKUs) {
        expect(() => validateSKUFormat(sku)).toThrow(BadRequestException);
      }
    });

    it('should normalize SKU before validation', () => {
      const testCases = [
        { input: '  PRODUCT  001  ', expected: 'PRODUCT-001' },
        { input: 'product/001', expected: 'PRODUCT-001' },
        { input: 'Product-001', expected: 'PRODUCT-001' },
        { input: 'PRODUCT__001', expected: 'PRODUCT-001' },
        { input: 'PRODUCT--001', expected: 'PRODUCT-001' },
      ];

      for (const testCase of testCases) {
        expect(normalizeSKU(testCase.input)).toBe(testCase.expected);
        expect(() => validateSKUFormat(testCase.input)).not.toThrow();
      }
    });

    it('should enforce SKU length constraints', () => {
      // Test minimum length
      const shortSKU = 'A1';
      expect(() => validateSKUFormat(shortSKU)).toThrow('SKU must be at least 3 characters long');

      // Test maximum length
      const longSKU = 'A'.repeat(51);
      expect(() => validateSKUFormat(longSKU)).toThrow('SKU must not exceed 50 characters');

      // Test valid range
      const validSKUs = [
        'ABC',
        'PROD-001',
        'A'.repeat(50),
      ];

      for (const sku of validSKUs) {
        expect(() => validateSKUFormat(sku)).not.toThrow();
      }
    });
  });

  describe('SKU uniqueness in database', () => {
    it('should prevent creating product with duplicate SKU in same company', async () => {
      const company = await testHelper.createTestCompany();
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      // Create first product
      const product1 = await productService.create({
        name: 'Product 1',
        sku: 'PROD-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 100,
        sellingPrice: 150,
      });

      expect(product1).toBeDefined();
      expect(product1.sku).toBe('PROD-001');

      // Try to create second product with same SKU
      const product2Data = {
        name: 'Product 2',
        sku: 'PROD-001', // Same SKU
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 200,
        sellingPrice: 250,
      };

      await expect(productService.create(product2Data)).rejects.toThrow(ConflictException);
    });

    it('should allow same SKU in different companies', async () => {
      const company1 = await testHelper.createTestCompany();
      const company2 = await testHelper.createTestCompany();

      const category1 = await testHelper.createTestCategory(company1.id);
      const category2 = await testHelper.createTestCategory(company2.id);

      const unit1 = await testHelper.createTestUnit(company1.id);
      const unit2 = await testHelper.createTestUnit(company2.id);

      // Create product in company 1
      const product1 = await productService.create({
        name: 'Product 1',
        sku: 'PROD-001',
        categoryId: category1.id,
        unitId: unit1.id,
        purchasePrice: 100,
        sellingPrice: 150,
      });

      // Create product in company 2 with same SKU
      const product2 = await productService.create({
        name: 'Product 2',
        sku: 'PROD-001', // Same SKU but different company
        categoryId: category2.id,
        unitId: unit2.id,
        purchasePrice: 200,
        sellingPrice: 250,
      });

      expect(product1).toBeDefined();
      expect(product2).toBeDefined();
      expect(product1.sku).toBe('PROD-001');
      expect(product2.sku).toBe('PROD-001');
    });

    it('should update SKU with conflict detection', async () => {
      const company = await testHelper.createTestCompany();
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      // Create two products
      const product1 = await productService.create({
        name: 'Product 1',
        sku: 'PROD-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 100,
        sellingPrice: 150,
      });

      const product2 = await productService.create({
        name: 'Product 2',
        sku: 'PROD-002',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 200,
        sellingPrice: 250,
      });

      // Update product1 to have product2's SKU - should fail
      await expect(productService.update(product1.id, {
        sku: 'PROD-002',
      })).rejects.toThrow(ConflictException);

      // Update product2 to have a new SKU - should succeed
      const updatedProduct2 = await productService.update(product2.id, {
        sku: 'PROD-003',
      });

      expect(updatedProduct2.sku).toBe('PROD-003');
    });

    it('should allow updating SKU to same SKU (no change)', async () => {
      const company = await testHelper.createTestCompany();
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      const product = await productService.create({
        name: 'Test Product',
        sku: 'PROD-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 100,
        sellingPrice: 150,
      });

      // Update with same SKU - should succeed
      const updatedProduct = await productService.update(product.id, {
        sku: 'PROD-001',
      });

      expect(updatedProduct.sku).toBe('PROD-001');
    });

    it('should perform case-insensitive SKU check', async () => {
      const company = await testHelper.createTestCompany();
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      // Create product with uppercase SKU
      const product1 = await productService.create({
        name: 'Product 1',
        sku: 'PROD-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 100,
        sellingPrice: 150,
      });

      // Try to create product with lowercase SKU - should fail
      const product2Data = {
        name: 'Product 2',
        sku: 'prod-001', // Case different but same SKU
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 200,
        sellingPrice: 250,
      };

      await expect(productService.create(product2Data)).rejects.toThrow(ConflictException);
    });

    it('should check SKU uniqueness across product updates', async () => {
      const company = await testHelper.createTestCompany();
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      // Create products
      const product1 = await productService.create({
        name: 'Product 1',
        sku: 'PROD-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 100,
        sellingPrice: 150,
      });

      const product2 = await productService.create({
        name: 'Product 2',
        sku: 'PROD-002',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 200,
        sellingPrice: 250,
      });

      const product3 = await productService.create({
        name: 'Product 3',
        sku: 'PROD-003',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 300,
        sellingPrice: 350,
      });

      // Multiple updates to test all combinations
      const updateTests = [
        // Test product1 trying to take product2's SKU
        { productId: product1.id, newSKU: 'PROD-002', shouldFail: true },
        // Test product1 trying to take product3's SKU
        { productId: product1.id, newSKU: 'PROD-003', shouldFail: true },
        // Test product2 trying to take product1's SKU
        { productId: product2.id, newSKU: 'PROD-001', shouldFail: true },
        // Test product3 trying to take product1's SKU
        { productId: product3.id, newSKU: 'PROD-001', shouldFail: true },
        // Test product1 trying to take new unique SKU
        { productId: product1.id, newSKU: 'PROD-004', shouldFail: false },
        // Test product2 trying to take new unique SKU
        { productId: product2.id, newSKU: 'PROD-005', shouldFail: false },
      ];

      for (const test of updateTests) {
        if (test.shouldFail) {
          await expect(productService.update(test.productId, { sku: test.newSKU }))
            .rejects.toThrow(ConflictException);
        } else {
          const updated = await productService.update(test.productId, { sku: test.newSKU });
          expect(updated.sku).toBe(test.newSKU);
        }
      }
    });
  });

  describe('SKU validation edge cases', () => {
    it('should handle SKU with special characters that are allowed', async () => {
      const company = await testHelper.createTestCompany();
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      const validSKUsWithAllowedChars = [
        'PROD-001',
        'PRD_001', // Underscore is allowed
        'PRD.001', // Dot is allowed
        'PRD001',
        'ABC123-XYZ',
      ];

      for (const sku of validSKUsWithAllowedChars) {
        const productData = {
          name: 'Test Product',
          sku,
          categoryId: category.id,
          unitId: unit.id,
          purchasePrice: 100,
          sellingPrice: 150,
        };

        expect(() => validateSKUFormat(sku)).not.toThrow();
      }
    });

    it('should handle SKU with numbers and letters mix', async () => {
      const company = await testHelper.createTestCompany();
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      const mixedSKUs = [
        'A1B2C3',
        'PROD001',
        'ITEM-123',
        'PRD-2024-001',
        'ABC123XYZ456',
      ];

      for (const sku of mixedSKUs) {
        expect(() => validateSKUFormat(sku)).not.toThrow();
      }
    });
  });
});

// Helper functions
function validateSKUFormat(sku: string): void {
  // Normalize SKU first
  const normalized = normalizeSKU(sku);

  // Check length
  if (normalized.length < 3) {
    throw new BadRequestException('SKU must be at least 3 characters long');
  }

  if (normalized.length > 50) {
    throw new BadRequestException('SKU must not exceed 50 characters');
  }

  // Check for invalid characters (only allow alphanumeric, hyphen, underscore, dot)
  if (!/^[a-zA-Z0-9_.-]+$/.test(normalized)) {
    throw new BadRequestException('SKU contains invalid characters. Only alphanumeric, hyphen, underscore, and dot are allowed');
  }

  // Check if it ends with hyphen
  if (normalized.endsWith('-')) {
    throw new BadRequestException('SKU cannot end with a hyphen');
  }

  // Check if it starts with hyphen
  if (normalized.startsWith('-')) {
    throw new BadRequestException('SKU cannot start with a hyphen');
  }
}

function normalizeSKU(sku: string): string {
  return sku
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_.-]/g, '-') // Replace invalid characters with hyphen
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^[-]+|[-]+$/g, ''); // Remove leading/trailing hyphens
}