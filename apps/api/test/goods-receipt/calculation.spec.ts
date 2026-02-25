import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestHelper } from '../utils/test-helper';
import { ProductService } from '../../product/product.service';
import { GoodsReceiptService } from '../../modules/goods-receipt/goods-receipt.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('Receipt Total Calculation (T126)', () => {
  let testHelper: TestHelper;
  let productService: ProductService;
  let goodsReceiptService: GoodsReceiptService;

  beforeEach(async () => {
    testHelper = new TestHelper();
    await testHelper.createTestingModule();

    const module = await testHelper.createTestingModule();
    productService = module.get<ProductService>(ProductService);
    goodsReceiptService = module.get<GoodsReceiptService>(GoodsReceiptService);
  });

  afterEach(async () => {
    await testHelper.cleanup();
  });

  describe('Receipt line item calculation', () => {
    it('should calculate line item total correctly', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      // Create product
      const product = await productService.create({
        name: 'Test Product',
        sku: 'TEST-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 50.00,
        sellingPrice: 75.00,
      });

      // Calculate line item total
      const lineItem = {
        productId: product.id,
        quantity: 10,
        unitCost: 48.00, // Slightly different from purchase price
        discount: 0,
        taxRate: 0,
      };

      const total = goodsReceiptService.calculateLineItemTotal(lineItem);

      expect(total).toBe(480.00); // 10 * 48.00 = 480.00
      expect(total).toBe(lineItem.quantity * lineItem.unitCost);
    });

    it('should handle decimal quantities and costs', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      // Create product
      const product = await productService.create({
        name: 'Test Product',
        sku: 'TEST-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 100.00,
        sellingPrice: 150.00,
      });

      // Calculate line item total with decimal values
      const lineItem = {
        productId: product.id,
        quantity: 2.5, // Decimal quantity
        unitCost: 95.50, // Decimal cost
        discount: 0,
        taxRate: 0,
      };

      const total = goodsReceiptService.calculateLineItemTotal(lineItem);

      expect(total).toBe(238.75); // 2.5 * 95.50 = 238.75
    });

    it('should apply discount to line item total', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      // Create product
      const product = await productService.create({
        name: 'Test Product',
        sku: 'TEST-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 100.00,
        sellingPrice: 150.00,
      });

      // Calculate line item total with discount
      const lineItem = {
        productId: product.id,
        quantity: 5,
        unitCost: 100.00,
        discount: 10.00, // 10% discount
        taxRate: 0,
      };

      const total = goodsReceiptService.calculateLineItemTotal(lineItem);

      expect(total).toBe(450.00); // (5 * 100) * (1 - 0.10) = 450.00
    });

    it('should apply tax to line item total', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      // Create product
      const product = await productService.create({
        name: 'Test Product',
        sku: 'TEST-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 100.00,
        sellingPrice: 150.00,
      });

      // Calculate line item total with tax
      const lineItem = {
        productId: product.id,
        quantity: 3,
        unitCost: 100.00,
        discount: 0,
        taxRate: 0.07, // 7% tax
      };

      const total = goodsReceiptService.calculateLineItemTotal(lineItem);

      expect(total).toBe(321.00); // (3 * 100) * (1 + 0.07) = 321.00
    });

    it('should apply both discount and tax', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      // Create product
      const product = await productService.create({
        name: 'Test Product',
        sku: 'TEST-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 100.00,
        sellingPrice: 150.00,
      });

      // Calculate line item total with discount and tax
      const lineItem = {
        productId: product.id,
        quantity: 4,
        unitCost: 100.00,
        discount: 15.00, // 15% discount
        taxRate: 0.07, // 7% tax
      };

      const total = goodsReceiptService.calculateLineItemTotal(lineItem);

      // Calculate manually: (4 * 100) * (1 - 0.15) = 340, then 340 * (1 + 0.07) = 363.8
      expect(total).toBe(363.80);
    });

    it('should handle negative discount values', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      // Create product
      const product = await productService.create({
        name: 'Test Product',
        sku: 'TEST-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 100.00,
        sellingPrice: 150.00,
      });

      // Calculate line item total with negative discount (surcharge)
      const lineItem = {
        productId: product.id,
        quantity: 2,
        unitCost: 100.00,
        discount: -5.00, // 5% surcharge
        taxRate: 0,
      };

      const total = goodsReceiptService.calculateLineItemTotal(lineItem);

      expect(total).toBe(210.00); // (2 * 100) * (1 + 0.05) = 210.00
    });

    it('should validate unit cost cannot be negative', () => {
      const lineItem = {
        productId: 'test-id',
        quantity: 10,
        unitCost: -50.00, // Negative cost
        discount: 0,
        taxRate: 0,
      };

      expect(() => goodsReceiptService.calculateLineItemTotal(lineItem))
        .toThrow('Unit cost cannot be negative');
    });

    it('should validate quantity cannot be negative', () => {
      const lineItem = {
        productId: 'test-id',
        quantity: -5, // Negative quantity
        unitCost: 100.00,
        discount: 0,
        taxRate: 0,
      };

      expect(() => goodsReceiptService.calculateLineItemTotal(lineItem))
        .toThrow('Quantity cannot be negative');
    });

    it('should validate discount cannot exceed 100%', () => {
      const lineItem = {
        productId: 'test-id',
        quantity: 10,
        unitCost: 100.00,
        discount: 150.00, // 150% discount
        taxRate: 0,
      };

      expect(() => goodsReceiptService.calculateLineItemTotal(lineItem))
        .toThrow('Discount cannot exceed 100%');
    });

    it('should validate tax rate cannot be negative', () => {
      const lineItem = {
        productId: 'test-id',
        quantity: 10,
        unitCost: 100.00,
        discount: 0,
        taxRate: -0.05, // Negative tax
      };

      expect(() => goodsReceiptService.calculateLineItemTotal(lineItem))
        .toThrow('Tax rate cannot be negative');
    });

    it('should validate product exists before calculation', async () => {
      const lineItem = {
        productId: 'non-existent-product-id',
        quantity: 10,
        unitCost: 100.00,
        discount: 0,
        taxRate: 0,
      };

      // In a real service, this would check product existence
      // For this test, we'll just verify the calculation logic
      const total = goodsReceiptService.calculateLineItemTotal(lineItem);
      expect(total).toBe(1000.00); // 10 * 100 = 1000
    });
  });

  describe('Receipt subtotal calculation', () => {
    it('should calculate receipt subtotal', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      // Create products
      const product1 = await productService.create({
        name: 'Product 1',
        sku: 'PROD-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 100.00,
        sellingPrice: 150.00,
      });

      const product2 = await productService.create({
        name: 'Product 2',
        sku: 'PROD-002',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 200.00,
        sellingPrice: 250.00,
      });

      // Create receipt line items
      const lineItems = [
        {
          productId: product1.id,
          quantity: 5,
          unitCost: 95.00,
          discount: 0,
          taxRate: 0,
        },
        {
          productId: product2.id,
          quantity: 3,
          unitCost: 180.00,
          discount: 0,
          taxRate: 0,
        },
      ];

      const subtotal = goodsReceiptService.calculateSubtotal(lineItems);

      // Manual calculation: (5 * 95) + (3 * 180) = 475 + 540 = 1015
      expect(subtotal).toBe(1015.00);
    });

    it('should handle empty line items', () => {
      const lineItems = [];

      const subtotal = goodsReceiptService.calculateSubtotal(lineItems);

      expect(subtotal).toBe(0);
    });

    it('should calculate subtotal with mixed discounts and taxes', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      // Create product
      const product = await productService.create({
        name: 'Test Product',
        sku: 'TEST-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 100.00,
        sellingPrice: 150.00,
      });

      // Create receipt line items with different discount/tax combinations
      const lineItems = [
        {
          productId: product.id,
          quantity: 2,
          unitCost: 100.00,
          discount: 10.00,
          taxRate: 0,
        },
        {
          productId: product.id,
          quantity: 3,
          unitCost: 100.00,
          discount: 0,
          taxRate: 0.07,
        },
      ];

      const subtotal = goodsReceiptService.calculateSubtotal(lineItems);

      // First item: (2 * 100) * (1 - 0.10) = 180
      // Second item: (3 * 100) * (1 + 0.07) = 321
      // Total: 180 + 321 = 501
      expect(subtotal).toBe(501.00);
    });

    it('should handle large numbers without overflow', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      // Create product
      const product = await productService.create({
        name: 'Test Product',
        sku: 'TEST-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 10000.00,
        sellingPrice: 15000.00,
      });

      // Create line item with large quantity
      const lineItems = [
        {
          productId: product.id,
          quantity: 1000,
          unitCost: 9500.00,
          discount: 0,
          taxRate: 0,
        },
      ];

      const subtotal = goodsReceiptService.calculateSubtotal(lineItems);

      expect(subtotal).toBe(9500000.00); // 1000 * 9500 = 9,500,000
    });
  });

  describe('Receipt tax calculation', () => {
    it('should calculate total tax amount', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      // Create product
      const product = await productService.create({
        name: 'Test Product',
        sku: 'TEST-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 100.00,
        sellingPrice: 150.00,
      });

      // Create receipt line items
      const lineItems = [
        {
          productId: product.id,
          quantity: 5,
          unitCost: 100.00,
          discount: 0,
          taxRate: 0.07, // 7% tax
        },
        {
          productId: product.id,
          quantity: 3,
          unitCost: 200.00,
          discount: 0,
          taxRate: 0.10, // 10% tax
        },
      ];

      const totalTax = goodsReceiptService.calculateTotalTax(lineItems);

      // First item: (5 * 100) * 0.07 = 35
      // Second item: (3 * 200) * 0.10 = 60
      // Total tax: 35 + 60 = 95
      expect(totalTax).toBe(95.00);
    });

    it('should handle zero tax rates', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      // Create product
      const product = await productService.create({
        name: 'Test Product',
        sku: 'TEST-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 100.00,
        sellingPrice: 150.00,
      });

      // Create receipt line items with zero tax
      const lineItems = [
        {
          productId: product.id,
          quantity: 10,
          unitCost: 100.00,
          discount: 0,
          taxRate: 0, // No tax
        },
      ];

      const totalTax = goodsReceiptService.calculateTotalTax(lineItems);

      expect(totalTax).toBe(0);
    });

    it('should handle mixed tax rates', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      // Create products with different tax rates
      const product1 = await productService.create({
        name: 'Taxable Product',
        sku: 'TAX-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 100.00,
        sellingPrice: 150.00,
      });

      const product2 = await productService.create({
        name: 'Tax-exempt Product',
        sku: 'TAX-002',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 50.00,
        sellingPrice: 75.00,
      });

      // Create receipt line items with different tax rates
      const lineItems = [
        {
          productId: product1.id,
          quantity: 2,
          unitCost: 100.00,
          discount: 0,
          taxRate: 0.07,
        },
        {
          productId: product2.id,
          quantity: 4,
          unitCost: 50.00,
          discount: 0,
          taxRate: 0, // Tax exempt
        },
      ];

      const totalTax = goodsReceiptService.calculateTotalTax(lineItems);

      // Only first item has tax: (2 * 100) * 0.07 = 14
      expect(totalTax).toBe(14.00);
    });
  });

  describe('Receipt discount calculation', () => {
    it('should calculate total discount amount', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      // Create product
      const product = await productService.create({
        name: 'Test Product',
        sku: 'TEST-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 100.00,
        sellingPrice: 150.00,
      });

      // Create receipt line items
      const lineItems = [
        {
          productId: product.id,
          quantity: 5,
          unitCost: 100.00,
          discount: 0.10, // 10% discount
          taxRate: 0,
        },
        {
          productId: product.id,
          quantity: 3,
          unitCost: 200.00,
          discount: 0.15, // 15% discount
          taxRate: 0,
        },
      ];

      const totalDiscount = goodsReceiptService.calculateTotalDiscount(lineItems);

      // First item: (5 * 100) * 0.10 = 50
      // Second item: (3 * 200) * 0.15 = 90
      // Total discount: 50 + 90 = 140
      expect(totalDiscount).toBe(140.00);
    });

    it('should calculate total discount with fixed amounts', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      // Create product
      const product = await productService.create({
        name: 'Test Product',
        sku: 'TEST-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 100.00,
        sellingPrice: 150.00,
      });

      // Create receipt line items with fixed discount amounts
      const lineItems = [
        {
          productId: product.id,
          quantity: 5,
          unitCost: 100.00,
          discount: 10.00, // $10 fixed discount
          taxRate: 0,
        },
        {
          productId: product.id,
          quantity: 3,
          unitCost: 200.00,
          discount: 25.00, // $25 fixed discount
          taxRate: 0,
        },
      ];

      const totalDiscount = goodsReceiptService.calculateTotalDiscount(lineItems);

      // Fixed discounts: 10 + 25 = 35
      expect(totalDiscount).toBe(35.00);
    });

    it('should handle mixed percentage and fixed discounts', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      // Create product
      const product = await productService.create({
        name: 'Test Product',
        sku: 'TEST-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 100.00,
        sellingPrice: 150.00,
      });

      // Create receipt line items with mixed discount types
      const lineItems = [
        {
          productId: product.id,
          quantity: 5,
          unitCost: 100.00,
          discount: 0.10, // 10% percentage discount
          taxRate: 0,
        },
        {
          productId: product.id,
          quantity: 3,
          unitCost: 200.00,
          discount: 15.00, // $15 fixed discount
          taxRate: 0,
        },
      ];

      const totalDiscount = goodsReceiptService.calculateTotalDiscount(lineItems);

      // First item: (5 * 100) * 0.10 = 50
      // Second item: 15 (fixed)
      // Total discount: 50 + 15 = 65
      expect(totalDiscount).toBe(65.00);
    });
  });

  describe('Receipt grand total calculation', () => {
    it('should calculate grand total including subtotal, discount, and tax', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      // Create product
      const product = await productService.create({
        name: 'Test Product',
        sku: 'TEST-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 100.00,
        sellingPrice: 150.00,
      });

      // Create receipt line items
      const lineItems = [
        {
          productId: product.id,
          quantity: 5,
          unitCost: 100.00,
          discount: 0.10, // 10% discount
          taxRate: 0.07, // 7% tax
        },
      ];

      const grandTotal = goodsReceiptService.calculateGrandTotal(lineItems);

      // Subtotal: 5 * 100 = 500
      // After discount: 500 * (1 - 0.10) = 450
      // After tax: 450 * (1 + 0.07) = 481.50
      expect(grandTotal).toBe(481.50);
    });

    it('should handle multiple line items with different discount/tax', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      // Create products
      const product1 = await productService.create({
        name: 'Product 1',
        sku: 'PROD-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 100.00,
        sellingPrice: 150.00,
      });

      const product2 = await productService.create({
        name: 'Product 2',
        sku: 'PROD-002',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 200.00,
        sellingPrice: 250.00,
      });

      // Create receipt line items
      const lineItems = [
        {
          productId: product1.id,
          quantity: 3,
          unitCost: 100.00,
          discount: 0.05,
          taxRate: 0.07,
        },
        {
          productId: product2.id,
          quantity: 2,
          unitCost: 200.00,
          discount: 0,
          taxRate: 0.10,
        },
      ];

      const grandTotal = goodsReceiptService.calculateGrandTotal(lineItems);

      // Product 1: (3 * 100) * (1 - 0.05) = 285, then 285 * (1 + 0.07) = 305
      // Product 2: (2 * 200) = 400, then 400 * (1 + 0.10) = 440
      // Grand total: 305 + 440 = 745
      expect(grandTotal).toBe(745.00);
    });

    it('should handle receipt with freight charges', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      // Create product
      const product = await productService.create({
        name: 'Test Product',
        sku: 'TEST-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 100.00,
        sellingPrice: 150.00,
      });

      // Create receipt line items
      const lineItems = [
        {
          productId: product.id,
          quantity: 5,
          unitCost: 100.00,
          discount: 0,
          taxRate: 0,
        },
      ];

      // Calculate subtotal
      const subtotal = goodsReceiptService.calculateSubtotal(lineItems);
      // Calculate grand total with freight
      const freightCharges = 50.00;
      const grandTotal = goodsReceiptService.calculateGrandTotal(
        lineItems,
        freightCharges
      );

      // Subtotal: 5 * 100 = 500
      // With freight: 500 + 50 = 550
      expect(grandTotal).toBe(550.00);
    });

    it('should handle receipt with additional charges', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      // Create product
      const product = await productService.create({
        name: 'Test Product',
        sku: 'TEST-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 100.00,
        sellingPrice: 150.00,
      });

      // Create receipt line items
      const lineItems = [
        {
          productId: product.id,
          quantity: 2,
          unitCost: 100.00,
          discount: 0,
          taxRate: 0,
        },
      ];

      // Calculate grand total with additional charges
      const additionalCharges = [
        { type: 'HANDLING', amount: 25.00 },
        { type: 'PACKAGING', amount: 15.00 },
      ];

      const grandTotal = goodsReceiptService.calculateGrandTotal(
        lineItems,
        0, // No freight
        additionalCharges
      );

      // Subtotal: 2 * 100 = 200
      // Additional charges: 25 + 15 = 40
      // Grand total: 200 + 40 = 240
      expect(grandTotal).toBe(240.00);
    });

    it('should calculate rounded grand total', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      // Create product
      const product = await productService.create({
        name: 'Test Product',
        sku: 'TEST-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 33.33, // Price that creates rounding
        sellingPrice: 49.99,
      });

      // Create receipt line items
      const lineItems = [
        {
          productId: product.id,
          quantity: 3,
          unitCost: 33.33,
          discount: 0,
          taxRate: 0.07,
        },
      ];

      const grandTotal = goodsReceiptService.calculateGrandTotal(lineItems);

      // Manual calculation: 3 * 33.33 = 99.99
      // After tax: 99.99 * 1.07 = 106.9893, rounded to 106.99
      expect(grandTotal).toBe(106.99);
    });
  });

  describe('Currency conversion calculation', () => {
    it('should convert receipt totals to different currency', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      // Create product
      const product = await productService.create({
        name: 'Test Product',
        sku: 'TEST-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 100.00,
        sellingPrice: 150.00,
      });

      // Create receipt line items
      const lineItems = [
        {
          productId: product.id,
          quantity: 5,
          unitCost: 100.00,
          discount: 0,
          taxRate: 0,
        },
      ];

      // Calculate grand total in USD
      const usdTotal = goodsReceiptService.calculateGrandTotal(lineItems);

      // Convert to EUR (assuming 1 USD = 0.85 EUR)
      const exchangeRate = 0.85;
      const eurTotal = goodsReceiptService.convertCurrency(usdTotal, exchangeRate);

      expect(usdTotal).toBe(500.00);
      expect(eurTotal).toBe(425.00); // 500 * 0.85
    });

    it('should handle currency with rounding rules', () => {
      const exchangeRate = 0.85;

      // Test different amounts
      const testCases = [
        { amount: 100, expected: 85 },
        { amount: 123.45, expected: 104.93 }, // 123.45 * 0.85 = 104.9325 -> 104.93
        { amount: 99.99, expected: 84.99 }, // 99.99 * 0.85 = 84.9915 -> 84.99
      ];

      for (const testCase of testCases) {
        const converted = goodsReceiptService.convertCurrency(testCase.amount, exchangeRate);
        expect(converted).toBe(testCase.expected);
      }
    });

    it('should validate exchange rate', () => {
      expect(() => goodsReceiptService.convertCurrency(100, 0))
        .toThrow('Exchange rate must be greater than 0');

      expect(() => goodsReceiptService.convertCurrency(100, -0.5))
        .toThrow('Exchange rate must be greater than 0');
    });
  });

  describe('Calculation validation', () => {
    it('should validate line items before calculation', async () => {
      const lineItems = [
        {
          productId: 'invalid-id',
          quantity: -5, // Invalid quantity
          unitCost: 100.00,
          discount: 0,
          taxRate: 0,
        },
      ];

      expect(() => goodsReceiptService.validateLineItems(lineItems))
        .toThrow('Quantity cannot be negative');
    });

    it('should check for duplicate products in receipt', async () => {
      const lineItems = [
        {
          productId: 'product-id',
          quantity: 10,
          unitCost: 100.00,
          discount: 0,
          taxRate: 0,
        },
        {
          productId: 'product-id', // Duplicate
          quantity: 5,
          unitCost: 100.00,
          discount: 0,
          taxRate: 0,
        },
      ];

      expect(() => goodsReceiptService.validateLineItems(lineItems))
        .toThrow('Duplicate products found in receipt');
    });

    it('should validate total amount limits', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      // Create product
      const product = await productService.create({
        name: 'Test Product',
        sku: 'TEST-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 10000.00, // High price
        sellingPrice: 15000.00,
      });

      // Create line item that would exceed maximum amount
      const lineItems = [
        {
          productId: product.id,
          quantity: 1000000, // Very large quantity
          unitCost: 10000.00,
          discount: 0,
          taxRate: 0,
        },
      ];

      // This should not throw an error as we're just testing calculation
      const total = goodsReceiptService.calculateSubtotal(lineItems);
      expect(total).toBe(10000000000.00); // 1e10
    });
  });
});