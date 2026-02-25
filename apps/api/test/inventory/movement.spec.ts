import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestHelper } from '../utils/test-helper';
import { ProductService } from '../src/modules/product/product.service';
import { InventoryService } from '../src/modules/inventory/inventory.service';
import { StockMovementService } from '../src/modules/infrastructure/stock-movement.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('Movement History (T108)', () => {
  let testHelper: TestHelper;
  let productService: ProductService;
  let inventoryService: InventoryService;
  let stockMovementService: StockMovementService;

  beforeEach(async () => {
    testHelper = new TestHelper();
    await testHelper.createTestingModule();

    const module = await testHelper.createTestingModule();
    productService = module.get<ProductService>(ProductService);
    inventoryService = module.get<InventoryService>(InventoryService);
    stockMovementService = module.get<StockMovementService>(StockMovementService);
  });

  afterEach(async () => {
    await testHelper.cleanup();
  });

  describe('Stock movement creation', () => {
    it('should create goods receipt movement', async () => {
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

      // Create goods receipt movement
      const movement = await stockMovementService.createGoodsReceipt({
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 100,
        unitCost: 95.00,
        totalCost: 9500.00,
        reference: 'GR-001',
        notes: 'Initial stock receipt',
        userId: 'user-123', // In real app, get from auth context
      });

      expect(movement).toBeDefined();
      expect(movement.productId).toBe(product.id);
      expect(movement.warehouseId).toBe(warehouse.id);
      expect(movement.quantity).toBe(100);
      expect(movement.type).toBe('GOODS_RECEIPT');
      expect(movement.reference).toBe('GR-001');
      expect(movement.status).toBe('COMPLETED');
      expect(movement.timestamp).toBeDefined();
    });

    it('should create goods issue movement', async () => {
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

      // Create goods issue movement
      const movement = await stockMovementService.createGoodsIssue({
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 30,
        reference: 'GI-001',
        notes: 'Customer order #123',
        userId: 'user-123',
      });

      expect(movement).toBeDefined();
      expect(movement.productId).toBe(product.id);
      expect(movement.warehouseId).toBe(warehouse.id);
      expect(movement.quantity).toBe(30);
      expect(movement.type).toBe('GOODS_ISSUE');
      expect(movement.reference).toBe('GI-001');
      expect(movement.status).toBe('COMPLETED');
    });

    it('should create stock adjustment movement', async () => {
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

      // Create adjustment movement
      const movement = await stockMovementService.createAdjustment({
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: -20, // Negative for reduction
        reference: 'ADJ-001',
        notes: 'Stock count discrepancy',
        userId: 'user-123',
        adjustmentReason: 'COUNT_VARIANCE',
      });

      expect(movement).toBeDefined();
      expect(movement.quantity).toBe(-20);
      expect(movement.type).toBe('ADJUSTMENT');
      expect(movement.adjustmentReason).toBe('COUNT_VARIANCE');
    });

    it('should create stock transfer movement', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse1 = await testHelper.createTestWarehouse(company.id, { code: 'WH001' });
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

      // Create initial stock in warehouse 1
      await testHelper.createTestStock(product.id, warehouse1.id, 100);

      // Create transfer movement
      const movement = await stockMovementService.createTransfer({
        productId: product.id,
        fromWarehouseId: warehouse1.id,
        toWarehouseId: warehouse2.id,
        quantity: 25,
        reference: 'TF-001',
        notes: 'Transfer between warehouses',
        userId: 'user-123',
      });

      expect(movement).toBeDefined();
      expect(movement.productId).toBe(product.id);
      expect(movement.fromWarehouseId).toBe(warehouse1.id);
      expect(movement.toWarehouseId).toBe(warehouse2.id);
      expect(movement.quantity).toBe(25);
      expect(movement.type).toBe('TRANSFER');
    });

    it('should validate goods receipt quantity', async () => {
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

      // Try to create goods receipt with negative quantity
      await expect(stockMovementService.createGoodsReceipt({
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: -10,
        unitCost: 100,
        totalCost: -1000,
        reference: 'GR-001',
        userId: 'user-123',
      })).rejects.toThrow('Invalid quantity');
    });

    it('should validate goods issue against available stock', async () => {
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
      await testHelper.createTestStock(product.id, warehouse.id, 50);

      // Try to issue more than available
      await expect(stockMovementService.createGoodsIssue({
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 100, // More than 50
        reference: 'GI-001',
        userId: 'user-123',
      })).rejects.toThrow('Insufficient stock');
    });
  });

  describe('Movement query and filtering', () => {
    it('should get movement history by product', async () => {
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

      // Create multiple movements
      await stockMovementService.createGoodsReceipt({
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 100,
        unitCost: 100,
        totalCost: 10000,
        reference: 'GR-001',
        userId: 'user-123',
      });

      await stockMovementService.createGoodsIssue({
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 30,
        reference: 'GI-001',
        userId: 'user-123',
      });

      // Get movements for product
      const movements = await stockMovementService.getMovementsByProduct(product.id);

      expect(movements.length).toBe(2);
      expect(movements.every(m => m.productId === product.id)).toBe(true);
    });

    it('should get movement history by warehouse', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse1 = await testHelper.createTestWarehouse(company.id, { code: 'WH001' });
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

      // Create movements in different warehouses
      await stockMovementService.createGoodsReceipt({
        productId: product.id,
        warehouseId: warehouse1.id,
        quantity: 100,
        unitCost: 100,
        totalCost: 10000,
        reference: 'GR-001',
        userId: 'user-123',
      });

      await stockMovementService.createGoodsReceipt({
        productId: product.id,
        warehouseId: warehouse2.id,
        quantity: 50,
        unitCost: 100,
        totalCost: 5000,
        reference: 'GR-002',
        userId: 'user-123',
      });

      // Get movements for warehouse 1
      const movements = await stockMovementService.getMovementsByWarehouse(warehouse1.id);

      expect(movements.length).toBe(1);
      expect(movements[0].warehouseId).toBe(warehouse1.id);
    });

    it('should get movement history by date range', async () => {
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

      // Create movements on different dates
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await stockMovementService.createGoodsReceipt({
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 100,
        unitCost: 100,
        totalCost: 10000,
        reference: 'GR-001',
        userId: 'user-123',
        timestamp: yesterday,
      });

      await stockMovementService.createGoodsIssue({
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 30,
        reference: 'GI-001',
        userId: 'user-123',
        timestamp: tomorrow,
      });

      // Get movements for date range
      const movements = await stockMovementService.getMovementsByDateRange(
        new Date(Date.now() - 86400000), // Yesterday
        new Date(Date.now() + 86400000)  // Tomorrow
      );

      expect(movements.length).toBe(1);
      expect(movements[0].reference).toBe('GR-001');
    });

    it('should get movement history by type', async () => {
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

      // Create different types of movements
      await stockMovementService.createGoodsReceipt({
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 100,
        unitCost: 100,
        totalCost: 10000,
        reference: 'GR-001',
        userId: 'user-123',
      });

      await stockMovementService.createAdjustment({
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: -10,
        reference: 'ADJ-001',
        userId: 'user-123',
      });

      // Get goods receipt movements only
      const movements = await stockMovementService.getMovementsByType('GOODS_RECEIPT');

      expect(movements.length).toBe(1);
      expect(movements[0].type).toBe('GOODS_RECEIPT');
    });

    it('should get movement history by reference', async () => {
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

      // Create movements
      await stockMovementService.createGoodsReceipt({
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 100,
        unitCost: 100,
        totalCost: 10000,
        reference: 'GR-001',
        userId: 'user-123',
      });

      await stockMovementService.createGoodsIssue({
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 30,
        reference: 'GI-001',
        userId: 'user-123',
      });

      // Get movements by specific reference
      const movements = await stockMovementService.getMovementsByReference('GR-001');

      expect(movements.length).toBe(1);
      expect(movements[0].reference).toBe('GR-001');
    });

    it('should paginate movement history', async () => {
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

      // Create multiple movements
      for (let i = 1; i <= 25; i++) {
        await stockMovementService.createGoodsReceipt({
          productId: product.id,
          warehouseId: warehouse.id,
          quantity: i * 10,
          unitCost: 100,
          totalCost: i * 1000,
          reference: `GR-${i.toString().padStart(3, '0')}`,
          userId: 'user-123',
        });
      }

      // Get first page
      const page1 = await stockMovementService.getMovementsByProduct(
        product.id,
        { page: 1, limit: 10 }
      );

      expect(page1.data.length).toBe(10);
      expect(page1.pagination.total).toBe(25);
      expect(page1.pagination.page).toBe(1);
      expect(page1.pagination.limit).toBe(10);

      // Get second page
      const page2 = await stockMovementService.getMovementsByProduct(
        product.id,
        { page: 2, limit: 10 }
      );

      expect(page2.data.length).toBe(10);
      expect(page2.pagination.page).toBe(2);

      // Get last page
      const lastPage = await stockMovementService.getMovementsByProduct(
        product.id,
        { page: 3, limit: 10 }
      );

      expect(lastPage.data.length).toBe(5); // Only 5 remaining
      expect(lastPage.pagination.page).toBe(3);
    });
  });

  describe('Movement status tracking', () => {
    it('should track movement approval workflow', async () => {
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

      // Create goods receipt movement
      const movement = await stockMovementService.createGoodsReceipt({
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 100,
        unitCost: 100,
        totalCost: 10000,
        reference: 'GR-001',
        userId: 'user-123',
        status: 'PENDING', // Start with pending status
      });

      // Approve movement
      const approved = await stockMovementService.approveMovement(movement.id, 'user-456');

      expect(approved.status).toBe('APPROVED');
      expect(approved.approvedBy).toBe('user-456');
      expect(approved.approvedAt).toBeDefined();
    });

    it('should reject pending movement', async () => {
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

      // Create goods receipt movement
      const movement = await stockMovementService.createGoodsReceipt({
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 100,
        unitCost: 100,
        totalCost: 10000,
        reference: 'GR-001',
        userId: 'user-123',
        status: 'PENDING',
      });

      // Reject movement
      const rejected = await stockMovementService.rejectMovement(
        movement.id,
        'user-456',
        'Invalid supplier invoice'
      );

      expect(rejected.status).toBe('REJECTED');
      expect(rejected.rejectedBy).toBe('user-456');
      expect(rejected.rejectionReason).toBe('Invalid supplier invoice');
      expect(rejected.rejectedAt).toBeDefined();
    });

    it('should prevent approving already completed movement', async () => {
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

      // Create goods receipt movement
      const movement = await stockMovementService.createGoodsReceipt({
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 100,
        unitCost: 100,
        totalCost: 10000,
        reference: 'GR-001',
        userId: 'user-123',
        status: 'COMPLETED',
      });

      // Try to approve completed movement - should fail
      await expect(stockMovementService.approveMovement(movement.id, 'user-456'))
        .rejects.toThrow('Movement is not pending');
    });

    it('should prevent approving movement without approval authority', async () => {
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

      // Create goods receipt movement
      const movement = await stockMovementService.createGoodsReceipt({
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 100,
        unitCost: 100,
        totalCost: 10000,
        reference: 'GR-001',
        userId: 'user-123',
        requiresApproval: true,
      });

      // Create different user roles
      const approverRole = await testHelper.getPrisma().role.create({
        data: {
          name: 'APPROVER',
          isSystem: true,
        },
      });

      const staffRole = await testHelper.getPrisma().role.create({
        data: {
          name: 'STAFF',
          isSystem: true,
        },
      });

      // Try to approve with staff role - should fail
      await expect(stockMovementService.approveMovement(movement.id, 'user-staff'))
        .rejects.toThrow('Insufficient permissions');
    });
  });

  describe('Movement reversal', () => {
    it('should reverse goods receipt movement', async () => {
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

      // Create goods receipt movement
      const receipt = await stockMovementService.createGoodsReceipt({
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 100,
        unitCost: 100,
        totalCost: 10000,
        reference: 'GR-001',
        userId: 'user-123',
      });

      // Reverse the receipt
      const reversal = await stockMovementService.reverseMovement(receipt.id, 'Return to supplier');

      expect(reversal.type).toBe('GOODS_RECEIPT_RETURN');
      expect(reversal.reference).toContain('REV-GR-001');
      expect(reversal.quantity).toBe(-100); // Negative reversal
      expect(reversal.reversalOf).toBe(receipt.id);
    });

    it('should reverse goods issue movement', async () => {
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

      // Create goods issue movement
      const issue = await stockMovementService.createGoodsIssue({
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 30,
        reference: 'GI-001',
        userId: 'user-123',
      });

      // Reverse the issue
      const reversal = await stockMovementService.reverseMovement(issue.id, 'Return from customer');

      expect(reversal.type).toBe('GOODS_ISSUE_RETURN');
      expect(reversal.reference).toContain('REV-GI-001');
      expect(reversal.quantity).toBe(30); // Positive return
      expect(reversal.reversalOf).toBe(issue.id);
    });

    it('should prevent reversing reversed movement', async () => {
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

      // Create goods receipt movement
      const receipt = await stockMovementService.createGoodsReceipt({
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 100,
        unitCost: 100,
        totalCost: 10000,
        reference: 'GR-001',
        userId: 'user-123',
      });

      // Reverse the receipt
      await stockMovementService.reverseMovement(receipt.id, 'Return to supplier');

      // Try to reverse the reversal - should fail
      await expect(stockMovementService.reverseMovement(
        receipt.id,
        'Another return'
      )).rejects.toThrow('Movement has already been reversed');
    });

    it('should handle reversal with partial quantity', async () => {
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

      // Create goods receipt movement
      const receipt = await stockMovementService.createGoodsReceipt({
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 100,
        unitCost: 100,
        totalCost: 10000,
        reference: 'GR-001',
        userId: 'user-123',
      });

      // Reverse only part of the receipt
      const reversal = await stockMovementService.reversePartialMovement(
        receipt.id,
        30, // Partial reversal
        'Partial return'
      );

      expect(reversal.quantity).toBe(-30);
      expect(reversal.reference).toContain('REV-GR-001');

      // Original receipt should remain partially unreversed
      const originalReceipt = await stockMovementService.findById(receipt.id);
      expect(originalReceipt.status).toBe('COMPLETED_PARTIALLY_REVERSED');
    });
  });

  describe('Movement analytics and reporting', () => {
    it('should calculate total movements by type', async () => {
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

      // Create different types of movements
      await stockMovementService.createGoodsReceipt({
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 100,
        unitCost: 100,
        totalCost: 10000,
        reference: 'GR-001',
        userId: 'user-123',
      });

      await stockMovementService.createGoodsIssue({
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 30,
        reference: 'GI-001',
        userId: 'user-123',
      });

      await stockMovementService.createAdjustment({
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: -10,
        reference: 'ADJ-001',
        userId: 'user-123',
      });

      // Get movement statistics
      const stats = await stockMovementService.getMovementStatistics();

      expect(stats.totalMovements).toBe(3);
      expect(stats.byType.GOODS_RECEIPT).toBe(1);
      expect(stats.byType.GOODS_ISSUE).toBe(1);
      expect(stats.byType.ADJUSTMENT).toBe(1);
    });

    it('should calculate total movement value', async () => {
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

      // Create movements with different values
      await stockMovementService.createGoodsReceipt({
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 100,
        unitCost: 50,
        totalCost: 5000,
        reference: 'GR-001',
        userId: 'user-123',
      });

      await stockMovementService.createGoodsReceipt({
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 50,
        unitCost: 60,
        totalCost: 3000,
        reference: 'GR-002',
        userId: 'user-123',
      });

      // Get movement value statistics
      const stats = await stockMovementService.getMovementValueStatistics();

      expect(stats.totalReceiptValue).toBe(8000); // 5000 + 3000
      expect(stats.totalIssueValue).toBe(0);
      expect(stats.netValue).toBe(8000);
    });

    it('should generate movement summary report', async () => {
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

      // Create movements
      await stockMovementService.createGoodsReceipt({
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 100,
        unitCost: 50,
        totalCost: 5000,
        reference: 'GR-001',
        userId: 'user-123',
      });

      await stockMovementService.createGoodsIssue({
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 30,
        reference: 'GI-001',
        userId: 'user-123',
      });

      // Generate summary
      const summary = await stockMovementService.generateMovementSummary(
        { startDate: new Date(Date.now() - 86400000), endDate: new Date() }
      );

      expect(summary.period).toBeDefined();
      expect(summary.totalMovements).toBe(2);
      expect(summary.totalQuantityReceived).toBe(100);
      expect(summary.totalQuantityIssued).toBe(30);
      expect(summary.netQuantityChange).toBe(70);
    });
  });

  describe('Movement validation', () => {
    it('should validate product existence in movement', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);

      await expect(stockMovementService.createGoodsReceipt({
        productId: 'non-existent-product-id',
        warehouseId: warehouse.id,
        quantity: 100,
        unitCost: 50,
        totalCost: 5000,
        reference: 'GR-001',
        userId: 'user-123',
      })).rejects.toThrow('Product not found');
    });

    it('should validate warehouse existence in movement', async () => {
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

      await expect(stockMovementService.createGoodsReceipt({
        productId: product.id,
        warehouseId: 'non-existent-warehouse-id',
        quantity: 100,
        unitCost: 50,
        totalCost: 5000,
        reference: 'GR-001',
        userId: 'user-123',
      })).rejects.toThrow('Warehouse not found');
    });

    it('should validate reference uniqueness', async () => {
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

      // Create first movement
      await stockMovementService.createGoodsReceipt({
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 100,
        unitCost: 50,
        totalCost: 5000,
        reference: 'DUPLICATE-REF',
        userId: 'user-123',
      });

      // Try to create another movement with same reference - should fail
      await expect(stockMovementService.createGoodsReceipt({
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 50,
        unitCost: 50,
        totalCost: 2500,
        reference: 'DUPLICATE-REF',
        userId: 'user-123',
      })).rejects.toThrow('Reference already exists');
    });

    it('should validate movement direction', async () => {
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

      // Test negative quantity for goods receipt
      await expect(stockMovementService.createGoodsReceipt({
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: -10,
        unitCost: 50,
        totalCost: -500,
        reference: 'GR-INVALID',
        userId: 'user-123',
      })).rejects.toThrow('Goods receipt quantity must be positive');

      // Test positive quantity for goods issue
      await expect(stockMovementService.createGoodsIssue({
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: -10, // Negative for issue
        reference: 'GI-INVALID',
        userId: 'user-123',
      })).rejects.toThrow('Goods issue quantity must be positive');
    });
  });
});