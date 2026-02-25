import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestHelper } from '../utils/test-helper';
import { ProductService } from '../src/modules/product/product.service';
import { UnitService } from '../src/modules/product/application/use-cases/unit.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('Unit Conversions (T084)', () => {
  let testHelper: TestHelper;
  let productService: ProductService;
  let unitService: UnitService;

  beforeEach(async () => {
    testHelper = new TestHelper();
    await testHelper.createTestingModule();

    const module = await testHelper.createTestingModule();
    productService = module.get<ProductService>(ProductService);
    unitService = module.get<UnitService>(UnitService);
  });

  afterEach(async () => {
    await testHelper.cleanup();
  });

  describe('Unit basic operations', () => {
    it('should create base unit without conversion', async () => {
      const company = await testHelper.createTestCompany();

      const unit = await unitService.create({
        name: 'Piece',
        code: 'PC',
        companyId: company.id,
      });

      expect(unit).toBeDefined();
      expect(unit.name).toBe('Piece');
      expect(unit.code).toBe('PC');
      expect(unit.baseUnit).toBeNull();
      expect(unit.conversionRate).toBeNull();
      expect(unit.isBaseUnit).toBe(true);
    });

    it('should create derived unit with base unit reference', async () => {
      const company = await testHelper.createTestCompany();

      // Create base unit
      const baseUnit = await unitService.create({
        name: 'Kilogram',
        code: 'KG',
        companyId: company.id,
      });

      // Create derived unit
      const derivedUnit = await unitService.create({
        name: 'Gram',
        code: 'G',
        companyId: company.id,
        baseUnitId: baseUnit.id,
        conversionRate: 1000, // 1 KG = 1000 G
      });

      expect(derivedUnit).toBeDefined();
      expect(derivedUnit.baseUnitId).toBe(baseUnit.id);
      expect(derivedUnit.conversionRate).toBe(1000);
      expect(derivedUnit.isBaseUnit).toBe(false);

      // Verify base unit reference
      expect(derivedUnit.baseUnit).toBeDefined();
      expect(derivedUnit.baseUnit.id).toBe(baseUnit.id);
      expect(derivedUnit.baseUnit.name).toBe('Kilogram');
    });

    it('should validate conversion rate requirements', () => {
      const invalidRates = [
        0, // Zero
        -1, // Negative
        -100, // Negative
        Infinity, // Infinity
        -Infinity, // Negative infinity
        NaN, // Not a number
      ];

      for (const rate of invalidRates) {
        expect(() => validateConversionRate(rate)).toThrow(BadRequestException);
      }

      const validRates = [
        1, // 1:1 ratio
        1000, // 1:1000 ratio
        0.5, // Fractional ratio
        1.5, // Fractional ratio
        0.001, // Small ratio
      ];

      for (const rate of validRates) {
        expect(() => validateConversionRate(rate)).not.toThrow();
      }
    });

    it('should enforce unique unit codes within company', async () => {
      const company = await testHelper.createTestCompany();

      // Create first unit
      await unitService.create({
        name: 'Kilogram',
        code: 'KG',
        companyId: company.id,
      });

      // Try to create second unit with same code - should fail
      await expect(unitService.create({
        name: 'Something Else',
        code: 'KG', // Same code
        companyId: company.id,
      })).rejects.toThrow('Unit code already exists');
    });

    it('should allow same unit code in different companies', async () => {
      const company1 = await testHelper.createTestCompany();
      const company2 = await testHelper.createTestCompany();

      // Create unit in company 1
      await unitService.create({
        name: 'Kilogram',
        code: 'KG',
        companyId: company1.id,
      });

      // Create unit in company 2 with same code - should succeed
      const unit2 = await unitService.create({
        name: 'Kilogram',
        code: 'KG', // Same code but different company
        companyId: company2.id,
      });

      expect(unit2).toBeDefined();
    });
  });

  describe('Unit conversion calculations', () => {
    it('should convert from base to derived unit', async () => {
      const company = await testHelper.createTestCompany();

      // Create units
      const kg = await unitService.create({
        name: 'Kilogram',
        code: 'KG',
        companyId: company.id,
      });

      const g = await unitService.create({
        name: 'Gram',
        code: 'G',
        companyId: company.id,
        baseUnitId: kg.id,
        conversionRate: 1000,
      });

      // Test conversions
      expect(unitService.convertToBase(5, g)).toBe(5000); // 5 G = 5000 G
      expect(unitService.convertFromBase(5, kg)).toBe(5); // 5 KG = 5 KG
      expect(unitService.convertFromBase(1000, kg)).toBe(1); // 1000 KG = 1 KG
      expect(unitService.convertToBase(1, g)).toBe(1000); // 1 G = 1000 G

      // Test with decimal values
      expect(unitService.convertToBase(1.5, g)).toBe(1500); // 1.5 G = 1500 G
      expect(unitService.convertFromBase(1.5, kg)).toBe(1.5); // 1.5 KG = 1.5 KG
    });

    it('should convert between derived units', async () => {
      const company = await testHelper.createTestCompany();

      // Create units
      const kg = await unitService.create({
        name: 'Kilogram',
        code: 'KG',
        companyId: company.id,
      });

      const g = await unitService.create({
        name: 'Gram',
        code: 'G',
        companyId: company.id,
        baseUnitId: kg.id,
        conversionRate: 1000,
      });

      const mg = await unitService.create({
        name: 'Milligram',
        code: 'MG',
        companyId: company.id,
        baseUnitId: kg.id,
        conversionRate: 1000000,
      });

      // Conversions should go through base unit
      // Convert 2000 MG to G
      const mgInBase = unitService.convertToBase(2000, mg); // 2000 MG = 2000000 MG
      const gFromMg = unitService.convertFromBase(mgInBase, g); // 2000000 MG = 2 G
      expect(gFromMg).toBe(2);

      // Convert 1.5 G to MG
      const gInBase = unitService.convertToBase(1.5, g); // 1.5 G = 1500 G
      const mgFromG = unitService.convertFromBase(gInBase, mg); // 1500 G = 1500000 MG
      expect(mgFromG).toBe(1500000);
    });

    it('should handle fractional conversion rates', async () => {
      const company = await testHelper.createTestCompany();

      // Create units
      const inch = await unitService.create({
        name: 'Inch',
        code: 'IN',
        companyId: company.id,
      });

      const cm = await unitService.create({
        name: 'Centimeter',
        code: 'CM',
        companyId: company.id,
        baseUnitId: inch.id,
        conversionRate: 2.54, // 1 IN = 2.54 CM
      });

      // Test conversions
      expect(unitService.convertFromBase(1, inch)).toBe(1); // 1 IN = 1 IN
      expect(unitService.convertToBase(1, cm)).toBe(1 / 2.54); // 1 CM = 0.3937 IN
      expect(unitService.convertFromBase(2.54, inch)).toBe(2.54); // 2.54 IN = 2.54 IN
      expect(unitService.convertToBase(2.54, cm)).toBe(1); // 2.54 CM = 1 IN

      // Test with precision
      const result = unitService.convertToBase(10, cm); // 10 CM = 3.937 IN
      expect(result).toBeCloseTo(3.937, 3);
    });

    it('should detect conversion cycles', async () => {
      const company = await testHelper.createTestCompany();

      // Create units
      const kg = await unitService.create({
        name: 'Kilogram',
        code: 'KG',
        companyId: company.id,
      });

      const g = await unitService.create({
        name: 'Gram',
        code: 'G',
        companyId: company.id,
        baseUnitId: kg.id,
        conversionRate: 1000,
      });

      // Try to make KG a derived unit of G - should create cycle
      await expect(unitService.update(kg.id, {
        baseUnitId: g.id,
        conversionRate: 0.001, // 1 KG = 0.001 G (but 1 G = 0.001 KG would be correct)
      })).rejects.toThrow('Conversion cycle detected');

      // Valid cycle break: 1 G = 0.001 KG
      const updatedKg = await unitService.update(kg.id, {
        baseUnitId: g.id,
        conversionRate: 0.001, // 1 KG = 0.001 G (this creates inverse relationship)
      });

      expect(updatedKg.baseUnitId).toBe(g.id);
      expect(updatedKg.conversionRate).toBe(0.001);
    });

    it('should validate conversion consistency', async () => {
      const company = await testHelper.createTestCompany();

      // Create units
      const kg = await unitService.create({
        name: 'Kilogram',
        code: 'KG',
        companyId: company.id,
      });

      const g = await unitService.create({
        name: 'Gram',
        code: 'G',
        companyId: company.id,
        baseUnitId: kg.id,
        conversionRate: 1000,
      });

      // Test conversion consistency
      // Convert 1 KG to G and back should equal 1
      const inG = unitService.convertFromBase(1, kg); // 1 KG = 1000 G
      const backToKg = unitService.convertToBase(inG, g); // 1000 G = 1 KG
      expect(backToKg).toBe(1);

      // Convert 2 KG to G and back should equal 2
      const inG2 = unitService.convertFromBase(2, kg); // 2 KG = 2000 G
      const backToKg2 = unitService.convertToBase(inG2, g); // 2000 G = 2 KG
      expect(backToKg2).toBe(2);
    });
  });

  describe('Unit conversion with inventory', () => {
    it('should calculate stock quantities in different units', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);

      // Create units
      const box = await unitService.create({
        name: 'Box',
        code: 'BX',
        companyId: company.id,
      });

      const each = await unitService.create({
        name: 'Each',
        code: 'EA',
        companyId: company.id,
        baseUnitId: box.id,
        conversionRate: 10, // 1 Box = 10 Each
      });

      // Create product
      const category = await testHelper.createTestCategory(company.id);
      const product = await productService.create({
        name: 'Test Product',
        sku: 'TEST-001',
        categoryId: category.id,
        unitId: box.id, // Base unit is Box
        purchasePrice: 100,
        sellingPrice: 150,
      });

      // Create stock in boxes
      await testHelper.createTestStock(product.id, warehouse.id, 5); // 5 boxes

      // Get stock in different units
      const stockInBoxes = await unitService.getStockInUnit(product.id, warehouse.id, box.id);
      const stockInEach = await unitService.getStockInUnit(product.id, warehouse.id, each.id);

      expect(stockInBoxes.quantity).toBe(5); // 5 boxes
      expect(stockInBoxes.unitCode).toBe('BX');
      expect(stockInEach.quantity).toBe(50); // 5 boxes * 10 each/box = 50 each
      expect(stockInEach.unitCode).toBe('EA');
    });

    it('should convert between units when updating stock', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);

      // Create units
      const caseUnit = await unitService.create({
        name: 'Case',
        code: 'CS',
        companyId: company.id,
      });

      const bottleUnit = await unitService.create({
        name: 'Bottle',
        code: 'BTL',
        companyId: company.id,
        baseUnitId: caseUnit.id,
        conversionRate: 24, // 1 Case = 24 Bottles
      });

      // Create product
      const category = await testHelper.createTestCategory(company.id);
      const product = await productService.create({
        name: 'Bottled Water',
        sku: 'WATER-001',
        categoryId: category.id,
        unitId: bottleUnit.id, // Base unit is Bottle
        purchasePrice: 5,
        sellingPrice: 8,
      });

      // Create initial stock in bottles
      await testHelper.createTestStock(product.id, warehouse.id, 48); // 48 bottles

      // Update stock using cases
      const casesToAdd = 2; // 2 cases = 48 bottles
      const bottlesEquivalent = casesToAdd * 24; // 48 bottles

      // Get current stock
      const currentStock = await unitService.getStockInUnit(product.id, warehouse.id, bottleUnit.id);
      const newQuantity = currentStock.quantity + bottlesEquivalent;

      // Update stock
      const updatedStock = await unitService.updateStock(
        product.id,
        warehouse.id,
        newQuantity,
        bottleUnit.id
      );

      expect(updatedStock.quantity).toBe(96); // 48 + 48 = 96 bottles
      expect(updatedStock.unitCode).toBe('BTL');

      // Verify in base unit (bottles)
      const stockInBottles = await unitService.getStockInUnit(product.id, warehouse.id, bottleUnit.id);
      expect(stockInBottles.quantity).toBe(96);
    });

    it('should handle stock conversions correctly', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);

      // Create units
      const kg = await unitService.create({
        name: 'Kilogram',
        code: 'KG',
        companyId: company.id,
      });

      const g = await unitService.create({
        name: 'Gram',
        code: 'G',
        companyId: company.id,
        baseUnitId: kg.id,
        conversionRate: 1000,
      });

      // Create product
      const category = await testHelper.createTestCategory(company.id);
      const product = await productService.create({
        name: 'Flour',
        sku: 'FLOUR-001',
        categoryId: category.id,
        unitId: kg.id, // Base unit is KG
        purchasePrice: 50,
        sellingPrice: 75,
      });

      // Create stock in kg
      await testHelper.createTestStock(product.id, warehouse.id, 2.5); // 2.5 kg

      // Verify stock in different units
      const stockInKg = await unitService.getStockInUnit(product.id, warehouse.id, kg.id);
      const stockInG = await unitService.getStockInUnit(product.id, warehouse.id, g.id);

      expect(stockInKg.quantity).toBe(2.5);
      expect(stockInKg.unitCode).toBe('KG');
      expect(stockInG.quantity).toBe(2500); // 2.5 kg * 1000 g/kg
      expect(stockInG.unitCode).toBe('G');
    });

    it('should handle partial unit conversions', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);

      // Create units
      const liter = await unitService.create({
        name: 'Liter',
        code: 'L',
        companyId: company.id,
      });

      const ml = await unitService.create({
        name: 'Milliliter',
        code: 'ML',
        companyId: company.id,
        baseUnitId: liter.id,
        conversionRate: 1000,
      });

      // Create product
      const category = await testHelper.createTestCategory(company.id);
      const product = await productService.create({
        name: 'Oil',
        sku: 'OIL-001',
        categoryId: category.id,
        unitId: liter.id, // Base unit is Liter
        purchasePrice: 100,
        sellingPrice: 150,
      });

      // Create stock with decimal value
      await testHelper.createTestStock(product.id, warehouse.id, 1.5); // 1.5 liters

      // Get stock in ml
      const stockInMl = await unitService.getStockInUnit(product.id, warehouse.id, ml.id);
      expect(stockInMl.quantity).toBe(1500); // 1.5 L * 1000 ml/L = 1500 ml
    });

    it('should validate unit availability before conversion', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);

      // Create units
      const kg = await unitService.create({
        name: 'Kilogram',
        code: 'KG',
        companyId: company.id,
      });

      // Create product
      const category = await testHelper.createTestCategory(company.id);
      const product = await productService.create({
        name: 'Product',
        sku: 'PROD-001',
        categoryId: category.id,
        unitId: kg.id,
        purchasePrice: 100,
        sellingPrice: 150,
      });

      // Create stock
      await testHelper.createTestStock(product.id, warehouse.id, 10);

      // Try to get stock in non-existent unit
      await expect(unitService.getStockInUnit(product.id, warehouse.id, 'non-existent-unit-id'))
        .rejects.toThrow('Unit not found');
    });
  });

  describe('Unit management operations', () => {
    it('should update unit conversion rate', async () => {
      const company = await testHelper.createTestCompany();

      // Create units
      const meter = await unitService.create({
        name: 'Meter',
        code: 'M',
        companyId: company.id,
      });

      const cm = await unitService.create({
        name: 'Centimeter',
        code: 'CM',
        companyId: company.id,
        baseUnitId: meter.id,
        conversionRate: 100, // 1 M = 100 CM
      });

      // Update conversion rate
      const updatedCm = await unitService.update(cm.id, {
        conversionRate: 100, // 1 M = 100 CM (same rate)
      });

      expect(updatedCm.conversionRate).toBe(100);
    });

    it('should prevent changing base unit when unit is used in stock', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);

      // Create units
      const kg = await unitService.create({
        name: 'Kilogram',
        code: 'KG',
        companyId: company.id,
      });

      const g = await unitService.create({
        name: 'Gram',
        code: 'G',
        companyId: company.id,
        baseUnitId: kg.id,
        conversionRate: 1000,
      });

      // Create product
      const category = await testHelper.createTestCategory(company.id);
      const product = await productService.create({
        name: 'Product',
        sku: 'PROD-001',
        categoryId: category.id,
        unitId: g.id,
        purchasePrice: 100,
        sellingPrice: 150,
      });

      // Create stock
      await testHelper.createTestStock(product.id, warehouse.id, 1000); // 1000g

      // Try to change g's base unit - should fail because it's used in stock
      await expect(unitService.update(g.id, {
        baseUnitId: null, // Try to make it a base unit
        conversionRate: null,
      })).rejects.toThrow('Cannot change unit conversion as it is used in stock');

      // But it should succeed if there's no stock
      // First delete stock
      await testHelper.getPrisma().stock.deleteMany({
        where: {
          productId: product.id,
        },
      });

      // Now try to change
      const updatedG = await unitService.update(g.id, {
        baseUnitId: null,
        conversionRate: null,
      });

      expect(updatedG.baseUnitId).toBeNull();
      expect(updatedG.conversionRate).toBeNull();
      expect(updatedG.isBaseUnit).toBe(true);
    });

    it('should cascade unit updates to related products', async () => {
      const company = await testHelper.createTestCompany();
      const warehouse = await testHelper.createTestWarehouse(company.id);

      // Create units
      const box = await unitService.create({
        name: 'Box',
        code: 'BX',
        companyId: company.id,
      });

      // Create product
      const category = await testHelper.createTestCategory(company.id);
      const product = await productService.create({
        name: 'Product',
        sku: 'PROD-001',
        categoryId: category.id,
        unitId: box.id,
        purchasePrice: 100,
        sellingPrice: 150,
      });

      // Create stock
      await testHelper.createTestStock(product.id, warehouse.id, 10);

      // Update unit name
      const updatedUnit = await unitService.update(box.id, {
        name: 'Case',
      });

      expect(updatedUnit.name).toBe('Case');

      // Product unit should still reference the same unit
      const updatedProduct = await productService.findById(product.id);
      expect(updatedProduct.unitId).toBe(box.id);
      expect(updatedProduct.unit.name).toBe('Case');
    });

    it('should get unit conversion path', async () => {
      const company = await testHelper.createTestCompany();

      // Create units
      const pallet = await unitService.create({
        name: 'Pallet',
        code: 'PAL',
        companyId: company.id,
      });

      const box = await unitService.create({
        name: 'Box',
        code: 'BX',
        companyId: company.id,
        baseUnitId: pallet.id,
        conversionRate: 20, // 1 Pallet = 20 Boxes
      });

      const each = await unitService.create({
        name: 'Each',
        code: 'EA',
        companyId: company.id,
        baseUnitId: box.id,
        conversionRate: 10, // 1 Box = 10 Each
      });

      // Get conversion path for Each to Pallet
      const path = await unitService.getConversionPath(each.id, pallet.id);

      expect(path).toBeDefined();
      expect(path.length).toBe(2);
      expect(path[0].unit.id).toBe(each.id);
      expect(path[0].conversionRate).toBe(10);
      expect(path[0].baseUnit.id).toBe(box.id);
      expect(path[1].unit.id).toBe(box.id);
      expect(path[1].conversionRate).toBe(20);
      expect(path[1].baseUnit.id).toBe(pallet.id);
    });

    it('should detect incompatible units for conversion', async () => {
      const company = await testHelper.createTestCompany();

      // Create different units
      const weight = await unitService.create({
        name: 'Kilogram',
        code: 'KG',
        companyId: company.id,
      });

      const volume = await unitService.create({
        name: 'Liter',
        code: 'L',
        companyId: company.id,
      });

      // These units should not have a conversion path
      await expect(unitService.getConversionPath(weight.id, volume.id))
        .rejects.toThrow('No conversion path between units');
    });
  });

  describe('Unit validation rules', () => {
    it('should validate unit code format', () => {
      const invalidCodes = [
        '', // Empty
        '   ', // Whitespace only
        'A', // Too short
        'A'.repeat(11), // Too long (max 10)
        'CODE WITH SPACES', // Contains spaces
        'CODE-WITH-HYPHENS', // Contains hyphens
        'CODE@WITH@SPECIAL', // Contains special chars
      ];

      for (const code of invalidCodes) {
        expect(() => validateUnitCode(code)).toThrow(BadRequestException);
      }

      const validCodes = [
        'KG',
        'PC',
        'AB',
        'ABC123',
        'A1B2C3',
        'CODE',
        'CODE_CODE',
      ];

      for (const code of validCodes) {
        expect(() => validateUnitCode(code)).not.toThrow();
      }
    });

    it('should validate unit name requirements', () => {
      const invalidNames = [
        '', // Empty
        '   ', // Whitespace only
        'A', // Too short
        'A'.repeat(101), // Too long (max 100)
      ];

      for (const name of invalidNames) {
        expect(() => validateUnitName(name)).toThrow(BadRequestException);
      }

      const validNames = [
        'Kilogram',
        'Piece',
        'Unit with spaces',
        'A'.repeat(100),
      ];

      for (const name of validNames) {
        expect(() => validateUnitName(name)).not.toThrow();
      }
    });

    it('should prevent creating unit with non-existent base unit', async () => {
      const company = await testHelper.createTestCompany();

      await expect(unitService.create({
        name: 'Gram',
        code: 'G',
        companyId: company.id,
        baseUnitId: 'non-existent-unit-id',
        conversionRate: 1000,
      })).rejects.toThrow('Base unit not found');
    });

    it('should prevent creating unit with itself as base unit', async () => {
      const company = await testHelper.createTestCompany();

      // Create unit
      const unit = await unitService.create({
        name: 'Kilogram',
        code: 'KG',
        companyId: company.id,
      });

      // Try to make unit its own base unit
      await expect(unitService.update(unit.id, {
        baseUnitId: unit.id,
        conversionRate: 1,
      })).rejects.toThrow('Unit cannot be its own base unit');
    });

    it('should enforce conversion rate precision', () => {
      // Test with high precision values
      const highPrecisionValues = [
        0.000001, // Very small rate
        999999.999999, // Very large rate
        0.3333333333, // Repeating decimal
      ];

      for (const rate of highPrecisionValues) {
        expect(() => validateConversionRate(rate)).not.toThrow();
      }
    });
  });
});

// Helper functions
function validateUnitCode(code: string): void {
  if (!code || code.trim().length === 0) {
    throw new BadRequestException('Unit code is required');
  }

  if (code.length < 2 || code.length > 10) {
    throw new BadRequestException('Unit code must be between 2 and 10 characters');
  }

  if (!/^[A-Z0-9_]+$/.test(code)) {
    throw new BadRequestException('Unit code can only contain letters, numbers, and underscores');
  }
}

function validateUnitName(name: string): void {
  if (!name || name.trim().length === 0) {
    throw new BadRequestException('Unit name is required');
  }

  if (name.length < 2 || name.length > 100) {
    throw new BadRequestException('Unit name must be between 2 and 100 characters');
  }
}

function validateConversionRate(rate: number): void {
  if (typeof rate !== 'number' || isNaN(rate)) {
    throw new BadRequestException('Conversion rate must be a valid number');
  }

  if (rate <= 0) {
    throw new BadRequestException('Conversion rate must be greater than 0');
  }

  if (!isFinite(rate)) {
    throw new BadRequestException('Conversion rate must be a finite number');
  }

  // Check for reasonable precision (e.g., not more than 6 decimal places)
  if (rate.toString().split('.')[1]?.length > 6) {
    throw new BadRequestException('Conversion rate precision too high (max 6 decimal places)');
  }
}