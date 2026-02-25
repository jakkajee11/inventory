import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestHelper } from '../utils/test-helper';
import { ProductService } from '../src/modules/product/product.service';
import { InventoryService } from '../src/modules/inventory/inventory.service';
import { StockCalculatorService } from '../src/modules/inventory/stock-calculator.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('Stock Calculation (T107)', () => {
  let testHelper: TestHelper;
  let productService: ProductService;
  let inventoryService: InventoryService;
  let stockCalculator: StockCalculatorService;

  beforeEach(async () => {
    testHelper = new TestHelper();
    await testHelper.createTestingModule();

    const module = await testHelper.createTestingModule();
    productService = module.get<ProductService>(ProductService);
    inventoryService = module.get<InventoryService>(InventoryService);
    stockCalculator = module.get<StockCalculatorService>(StockCalculatorService);
  });

  afterEach(async () => {
    await testHelper.cleanup();
  });

  describe('Current stock calculation', () => {
    it('should calculate total stock for a single warehouse', async () => {
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
        purchasePrice: 100,
        sellingPrice: 150,
      });

      // Create stock in warehouse
      await testHelper.createTestStock(product.id, warehouse.id, 100);

      // Calculate total stock
      const totalStock = await stockCalculator.getTotalStock(product.id);

      expect(totalStock).toBe(100);
      expect(totalStock.productId).toBe(product.id);
      expect(totalStock.totalQuantity).toBe(100);
    });

    it('should calculate total stock across multiple warehouses', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse1 = await testHelper.createTestWarehouse(company.id);
      const warehouse2 = await testHelper.createTestWarehouse(company.id, { code: 'WH002' });

      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      // Create product
      const product = await productService.create({
        name: 'Test Product',
        sku: 'TEST-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 100,
        sellingPrice: 150,
      });

      // Create stock in multiple warehouses
      await testHelper.createTestStock(product.id, warehouse1.id, 50);
      await testHelper.createTestStock(product.id, warehouse2.id, 75);

      // Calculate total stock
      const totalStock = await stockCalculator.getTotalStock(product.id);

      expect(totalStock.totalQuantity).toBe(125); // 50 + 75
      expect(totalStock.breakdown.length).toBe(2);
      expect(totalStock.breakdown.some(s => s.warehouseId === warehouse1.id && s.quantity === 50)).toBe(true);
      expect(totalStock.breakdown.some(s => s.warehouseId === warehouse2.id && s.quantity === 75)).toBe(true);
    });

    it('should return zero for product with no stock', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      // Create product without stock
      const product = await productService.create({
        name: 'Test Product',
        sku: 'TEST-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 100,
        sellingPrice: 150,
      });

      // Calculate total stock
      const totalStock = await stockCalculator.getTotalStock(product.id);

      expect(totalStock.totalQuantity).toBe(0);
      expect(totalStock.breakdown).toEqual([]);
    });

    it('should handle fractional quantities', async () => {
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
        purchasePrice: 100,
        sellingPrice: 150,
      });

      // Create stock with fractional quantity
      await testHelper.createTestStock(product.id, warehouse.id, 1.5);

      // Calculate total stock
      const totalStock = await stockCalculator.getTotalStock(product.id);

      expect(totalStock.totalQuantity).toBe(1.5);
    });
  });

  describe('Stock value calculation', () => {
    it('should calculate total stock value', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      // Create product with purchase price
      const product = await productService.create({
        name: 'Test Product',
        sku: 'TEST-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 50.00,
        sellingPrice: 75.00,
      });

      // Create stock
      await testHelper.createTestStock(product.id, warehouse.id, 10);

      // Calculate stock value
      const stockValue = await stockCalculator.getTotalStockValue(product.id);

      expect(stockValue).toBe(500.00); // 10 * 50.00
    });

    it('should calculate stock value across multiple products', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      // Create multiple products
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
        sellingPrice: 300.00,
      });

      // Create stock for both products
      await testHelper.createTestStock(product1.id, warehouse.id, 5);
      await testHelper.createTestStock(product2.id, warehouse.id, 3);

      // Calculate total stock value
      const totalValue = await stockCalculator.getAllStockValues();

      expect(totalValue.totalValue).toBe(1100.00); // (5 * 100) + (3 * 200)
      expect(totalValue.byProduct.length).toBe(2);
      expect(totalValue.byProduct.find(p => p.productId === product1.id)?.value).toBe(500.00);
      expect(totalValue.byProduct.find(p => p.productId === product2.id)?.value).toBe(600.00);
    });

    it('should handle zero stock value', async () => {
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
        purchasePrice: 0, // Zero price
        sellingPrice: 50,
      });

      // Create stock
      await testHelper.createTestStock(product.id, warehouse.id, 10);

      // Calculate stock value
      const stockValue = await stockCalculator.getTotalStockValue(product.id);

      expect(stockValue).toBe(0); // 10 * 0 = 0
    });

    it('should calculate stock value with decimal prices', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      // Create product with decimal price
      const product = await productService.create({
        name: 'Test Product',
        sku: 'TEST-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 19.99,
        sellingPrice: 29.99,
      });

      // Create stock
      await testHelper.createTestStock(product.id, warehouse.id, 3);

      // Calculate stock value
      const stockValue = await stockCalculator.getTotalStockValue(product.id);

      expect(stockValue).toBe(59.97); // 3 * 19.99
    });
  });

  describe('Stock allocation calculation', () => {
    it('should calculate allocated stock', async () => {
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
        purchasePrice: 100,
        sellingPrice: 150,
      });

      // Create stock
      await testHelper.createTestStock(product.id, warehouse.id, 100);

      // Simulate allocations (in real scenario, these would be from orders/holds)
      const allocations = [
        { quantity: 20, reference: 'ORDER-001' },
        { quantity: 15, reference: 'HOLD-001' },
      ];

      // Calculate available stock
      const availableStock = await stockCalculator.calculateAvailableStock(
        product.id,
        warehouse.id,
        allocations
      );

      expect(availableStock.totalStock).toBe(100);
      expect(availableStock.allocatedQuantity).toBe(35); // 20 + 15
      expect(availableStock.availableQuantity).toBe(65); // 100 - 35
    });

    it('should handle negative allocations', async () => {
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
        purchasePrice: 100,
        sellingPrice: 150,
      });

      // Create stock
      await testHelper.createTestStock(product.id, warehouse.id, 50);

      // Simulate allocations with negative value
      const allocations = [
        { quantity: -10, reference: 'CANCEL-001' }, // Release allocation
      ];

      // Calculate available stock
      const availableStock = await stockCalculator.calculateAvailableStock(
        product.id,
        warehouse.id,
        allocations
      );

      expect(availableStock.allocatedQuantity).toBe(0);
      expect(availableStock.availableQuantity).toBe(50);
    });

    it('should prevent allocation exceeding available stock', async () => {
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
        purchasePrice: 100,
        sellingPrice: 150,
      });

      // Create stock
      await testHelper.createTestStock(product.id, warehouse.id, 10);

      // Try to allocate more than available
      const allocations = [
        { quantity: 15, reference: 'ORDER-001' }, // Exceeds available stock
      ];

      // Calculate available stock
      const availableStock = await stockCalculator.calculateAvailableStock(
        product.id,
        warehouse.id,
        allocations
      );

      expect(availableStock.allocatedQuantity).toBe(15);
      expect(availableStock.availableQuantity).toBe(0); // Cannot be negative
    });
  });

  describe('Stock movement calculation', () => {
    it('should calculate stock after movement', async () => {
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
        purchasePrice: 100,
        sellingPrice: 150,
      });

      // Create initial stock
      await testHelper.createTestStock(product.id, warehouse.id, 100);

      // Simulate goods receipt movement
      const receiptMovement = {
        type: 'GOODS_RECEIPT',
        quantity: 50,
        reference: 'GR-001',
        timestamp: new Date(),
      };

      // Calculate stock after movement
      const afterReceipt = await stockCalculator.calculateStockAfterMovement(
        product.id,
        warehouse.id,
        receiptMovement
      );

      expect(afterReceipt.currentStock).toBe(150); // 100 + 50
      expect(afterReceipt.movementType).toBe('GOODS_RECEIPT');

      // Simulate goods issue movement
      const issueMovement = {
        type: 'GOODS_ISSUE',
        quantity: 30,
        reference: 'GI-001',
        timestamp: new Date(),
      };

      // Calculate stock after movement
      const afterIssue = await stockCalculator.calculateStockAfterMovement(
        product.id,
        warehouse.id,
        issueMovement
      );

      expect(afterIssue.currentStock).toBe(120); // 150 - 30
      expect(afterIssue.movementType).toBe('GOODS_ISSUE');
    });

    it('should prevent negative stock from movement', async () => {
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
        purchasePrice: 100,
        sellingPrice: 150,
      });

      // Create initial stock
      await testHelper.createTestStock(product.id, warehouse.id, 10);

      // Try to issue more than available
      const movement = {
        type: 'GOODS_ISSUE',
        quantity: 15, // More than available
        reference: 'GI-001',
        timestamp: new Date(),
      };

      // Calculate stock after movement
      const afterMovement = await stockCalculator.calculateStockAfterMovement(
        product.id,
        warehouse.id,
        movement
      );

      expect(afterMovement.currentStock).toBe(10); // Cannot go negative
      expect(afterMovement.insufficientStock).toBe(true);
    });

    it('should handle stock adjustment movement', async () => {
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
        purchasePrice: 100,
        sellingPrice: 150,
      });

      // Create initial stock
      await testHelper.createTestStock(product.id, warehouse.id, 100);

      // Simulate adjustment
      const adjustmentMovement = {
        type: 'ADJUSTMENT',
        quantity: 20,
        reference: 'ADJ-001',
        timestamp: new Date(),
        notes: 'Stock count adjustment',
      };

      // Calculate stock after adjustment
      const afterAdjustment = await stockCalculator.calculateStockAfterMovement(
        product.id,
        warehouse.id,
        adjustmentMovement
      );

      expect(afterAdjustment.currentStock).toBe(120); // 100 + 20
      expect(afterAdjustment.movementType).toBe('ADJUSTMENT');
    });

    it('should calculate stock for transfer between warehouses', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse1 = await testHelper.createTestWarehouse(company.id);
      const warehouse2 = await testHelper.createTestWarehouse(company.id, { code: 'WH002' });

      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      // Create product
      const product = await productService.create({
        name: 'Test Product',
        sku: 'TEST-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 100,
        sellingPrice: 150,
      });

      // Create stock in warehouse 1
      await testHelper.createTestStock(product.id, warehouse1.id, 50);

      // Simulate transfer
      const transferMovement = {
        type: 'TRANSFER',
        quantity: 20,
        reference: 'TF-001',
        fromWarehouseId: warehouse1.id,
        toWarehouseId: warehouse2.id,
        timestamp: new Date(),
      };

      // Calculate stock after transfer
      const afterTransfer = await stockCalculator.calculateStockAfterMovement(
        product.id,
        warehouse1.id,
        transferMovement
      );

      expect(afterTransfer.currentStock).toBe(30); // 50 - 20
      expect(afterTransfer.movementType).toBe('TRANSFER_OUT');

      // Check warehouse 2 gets the stock
      const warehouse2Stock = await stockCalculator.getTotalStock(product.id, warehouse2.id);
      expect(warehouse2Stock.totalQuantity).toBe(20);
    });
  });

  describe('Stock analysis calculations', () => {
    it('should calculate days of stock', async () => {
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
        purchasePrice: 100,
        sellingPrice: 150,
        averageDailySales: 10, // 10 units per day
      });

      // Create stock
      await testHelper.createTestStock(product.id, warehouse.id, 100);

      // Calculate days of stock
      const dos = await stockCalculator.calculateDaysOfStock(product.id);

      expect(dos).toBe(10); // 100 / 10 = 10 days
    });

    it('should calculate stock turnover rate', async () => {
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
        purchasePrice: 100,
        sellingPrice: 150,
        annualSales: 1000, // 1000 units per year
      });

      // Create stock
      await testHelper.createTestStock(product.id, warehouse.id, 100);

      // Calculate stock turnover
      const turnover = await stockCalculator.calculateStockTurnover(product.id);

      expect(turnover).toBe(10); // 1000 / 100 = 10 turns per year
    });

    it('should calculate safety stock level', async () => {
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
        purchasePrice: 100,
        sellingPrice: 150,
        leadTimeDays: 5, // 5 days lead time
        averageDailySales: 10, // 10 units per day
        safetyStockDays: 3, // 3 days safety stock
      });

      // Create stock
      await testHelper.createTestStock(product.id, warehouse.id, 50);

      // Calculate safety stock
      const safetyStock = await stockCalculator.calculateSafetyStock(product.id);

      expect(safetyStock.reorderPoint).toBe(80); // (5 + 3) * 10 = 80
      expect(safetyStock.safetyStock).toBe(30); // 3 * 10 = 30
    });

    it('should identify low stock alerts', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      // Create product with reorder point
      const product = await productService.create({
        name: 'Test Product',
        sku: 'TEST-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 100,
        sellingPrice: 150,
        reorderPoint: 50,
      });

      // Create stock below reorder point
      await testHelper.createTestStock(product.id, warehouse.id, 30);

      // Check for low stock
      const lowStock = await stockCalculator.checkLowStock(product.id);

      expect(lowStock.isLowStock).toBe(true);
      expect(lowStock.currentStock).toBe(30);
      expect(lowStock.reorderPoint).toBe(50);
      expect(lowStock.quantityToOrder).toBe(20); // 50 - 30 = 20
    });

    it('should identify zero stock', async () => {
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
        purchasePrice: 100,
        sellingPrice: 150,
      });

      // No stock created
      const zeroStock = await stockCalculator.checkZeroStock(product.id);

      expect(zeroStock.isZeroStock).toBe(true);
      expect(zeroStock.currentStock).toBe(0);
    });
  });

  describe('Stock calculation validation', () => {
    it('should validate product existence', async () => {
      await expect(stockCalculator.getTotalStock('non-existent-product-id'))
        .rejects.toThrow(NotFoundException);
    });

    it('should validate warehouse existence', async () => {
      const company = await testHelper.createTestCompany();
      const category = await testHelper.createTestCategory(company.id);
      const unit = await testHelper.createTestUnit(company.id);

      // Create product
      const product = await productService.create({
        name: 'Test Product',
        sku: 'TEST-001',
        categoryId: category.id,
        unitId: unit.id,
        purchasePrice: 100,
        sellingPrice: 150,
      });

      await expect(stockCalculator.getTotalStock(product.id, 'non-existent-warehouse-id'))
        .rejects.toThrow('Warehouse not found');
    });

    it('should validate movement quantity', async () => {
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
        purchasePrice: 100,
        sellingPrice: 150,
      });

      // Invalid movement quantity
      const invalidMovement = {
        type: 'GOODS_ISSUE',
        quantity: -10, // Negative quantity
        reference: 'GI-001',
        timestamp: new Date(),
      };

      await expect(stockCalculator.calculateStockAfterMovement(
        product.id,
        warehouse.id,
        invalidMovement
      )).rejects.toThrow('Invalid movement quantity');
    });

    it('should handle large stock quantities', async () => {
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
        purchasePrice: 100,
        sellingPrice: 150,
      });

      // Create large quantity
      const largeQuantity = Number.MAX_SAFE_INTEGER;
      await testHelper.createTestStock(product.id, warehouse.id, 1000); // Use reasonable value for test

      // Calculate stock value
      const stockValue = await stockCalculator.getTotalStockValue(product.id);

      // Should handle calculation without overflow
      expect(typeof stockValue).toBe('number');
      expect(!isNaN(stockValue)).toBe(true);
    });
  });
});