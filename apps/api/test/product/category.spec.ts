import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestHelper } from '../utils/test-helper';
import { ProductService } from '../src/modules/product/product.service';
import { CategoryService } from '../src/modules/product/application/use-cases/category.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('Hierarchical Categories (T083)', () => {
  let testHelper: TestHelper;
  let productService: ProductService;
  let categoryService: CategoryService;

  beforeEach(async () => {
    testHelper = new TestHelper();
    await testHelper.createTestingModule();

    const module = await testHelper.createTestingModule();
    productService = module.get<ProductService>(ProductService);
    categoryService = module.get<CategoryService>(CategoryService);
  });

  afterEach(async () => {
    await testHelper.cleanup();
  });

  describe('Category hierarchy structure', () => {
    it('should create root category without parent', async () => {
      const company = await testHelper.createTestCompany();

      const rootCategory = await categoryService.create({
        name: 'Electronics',
        code: 'ELEC',
        companyId: company.id,
      });

      expect(rootCategory).toBeDefined();
      expect(rootCategory.name).toBe('Electronics');
      expect(rootCategory.code).toBe('ELEC');
      expect(rootCategory.parentId).toBeNull();
      expect(rootCategory.level).toBe(0); // Root level
      expect(rootCategory.path).toBe('Electronics');
      expect(rootCategory.depth).toBe(0);
    });

    it('should create child category under parent', async () => {
      const company = await testHelper.createTestCompany();

      // Create parent category
      const parent = await categoryService.create({
        name: 'Electronics',
        code: 'ELEC',
        companyId: company.id,
      });

      // Create child category
      const child = await categoryService.create({
        name: 'Mobile Phones',
        code: 'MOBILE',
        companyId: company.id,
        parentId: parent.id,
      });

      expect(child).toBeDefined();
      expect(child.parentId).toBe(parent.id);
      expect(child.level).toBe(1);
      expect(child.path).toBe('Electronics/Mobile Phones');
      expect(child.depth).toBe(1);
    });

    it('should create multiple levels of hierarchy', async () => {
      const company = await testHelper.createTestCompany();

      // Level 0: Root
      const electronics = await categoryService.create({
        name: 'Electronics',
        code: 'ELEC',
        companyId: company.id,
      });

      // Level 1: Child
      const phones = await categoryService.create({
        name: 'Mobile Phones',
        code: 'MOBILE',
        companyId: company.id,
        parentId: electronics.id,
      });

      // Level 2: Grandchild
      const smartphones = await categoryService.create({
        name: 'Smartphones',
        code: 'SMART',
        companyId: company.id,
        parentId: phones.id,
      });

      // Level 3: Great-grandchild
      const iphones = await categoryService.create({
        name: 'iPhone',
        code: 'IPHONE',
        companyId: company.id,
        parentId: smartphones.id,
      });

      expect(electronics.level).toBe(0);
      expect(phones.level).toBe(1);
      expect(smartphones.level).toBe(2);
      expect(iphones.level).toBe(3);

      expect(electronics.path).toBe('Electronics');
      expect(phones.path).toBe('Electronics/Mobile Phones');
      expect(smartphones.path).toBe('Electronics/Mobile Phones/Smartphones');
      expect(iphones.path).toBe('Electronics/Mobile Phones/Smartphones/iPhone');
    });

    it('should validate parent-child relationships', async () => {
      const company = await testHelper.createTestCompany();

      // Create categories
      const root = await categoryService.create({
        name: 'Root',
        code: 'ROOT',
        companyId: company.id,
      });

      const child = await categoryService.create({
        name: 'Child',
        code: 'CHILD',
        companyId: company.id,
        parentId: root.id,
      });

      expect(child.parentId).toBe(root.id);
      expect(child.level).toBe(1);
    });

    it('should prevent circular references in hierarchy', async () => {
      const company = await testHelper.createTestCompany();

      // Create root category
      const root = await categoryService.create({
        name: 'Root',
        code: 'ROOT',
        companyId: company.id,
      });

      // Create child category
      const child = await categoryService.create({
        name: 'Child',
        code: 'CHILD',
        companyId: company.id,
        parentId: root.id,
      });

      // Try to make root a child of its own child - should fail
      await expect(categoryService.update(root.id, {
        parentId: child.id,
      })).rejects.toThrow('Circular reference detected');

      // Try to make category its own parent - should fail
      await expect(categoryService.update(child.id, {
        parentId: child.id,
      })).rejects.toThrow('Circular reference detected');
    });

    it('should prevent parent from being a child of its own descendants', async () => {
      const company = await testHelper.createTestCompany();

      // Create multi-level hierarchy
      const grandparent = await categoryService.create({
        name: 'Grandparent',
        code: 'GP',
        companyId: company.id,
      });

      const parent = await categoryService.create({
        name: 'Parent',
        code: 'P',
        companyId: company.id,
        parentId: grandparent.id,
      });

      const child = await categoryService.create({
        name: 'Child',
        code: 'C',
        companyId: company.id,
        parentId: parent.id,
      });

      // Try to make grandparent a child of child - should fail
      await expect(categoryService.update(grandparent.id, {
        parentId: child.id,
      })).rejects.toThrow('Circular reference detected');

      // Try to make parent a child of child - should fail
      await expect(categoryService.update(parent.id, {
        parentId: child.id,
      })).rejects.toThrow('Circular reference detected');
    });
  });

  describe('Category path and depth calculations', () => {
    it('should calculate path correctly for multiple levels', async () => {
      const company = await testHelper.createTestCompany();

      const root = await categoryService.create({
        name: 'A',
        code: 'A',
        companyId: company.id,
      });

      const child1 = await categoryService.create({
        name: 'B',
        code: 'B',
        companyId: company.id,
        parentId: root.id,
      });

      const child2 = await categoryService.create({
        name: 'C',
        code: 'C',
        companyId: company.id,
        parentId: child1.id,
      });

      const child3 = await categoryService.create({
        name: 'D',
        name: 'D',
        companyId: company.id,
        parentId: child2.id,
      });

      expect(root.path).toBe('A');
      expect(child1.path).toBe('A/B');
      expect(child2.path).toBe('A/B/C');
      expect(child3.path).toBe('A/B/C/D');

      expect(root.depth).toBe(0);
      expect(child1.depth).toBe(1);
      expect(child2.depth).toBe(2);
      expect(child3.depth).toBe(3);
    });

    it('should handle special characters in category names', async () => {
      const company = await testHelper.createTestCompany();

      const parent = await categoryService.create({
        name: 'Parent & Child',
        code: 'PARENT',
        companyId: company.id,
      });

      const child = await categoryService.create({
        name: 'Child with / slashes',
        code: 'CHILD',
        companyId: company.id,
        parentId: parent.id,
      });

      // Path should be stored properly
      expect(parent.path).toBe('Parent & Child');
      expect(child.path).toBe('Parent & Child/Child with / slashes');
    });

    it('should calculate level based on depth', async () => {
      const company = await testHelper.createTestCompany();

      const categories = [];
      let parentId = null;

      // Create 5 levels deep
      for (let i = 0; i < 5; i++) {
        const category = await categoryService.create({
          name: `Level ${i}`,
          code: `L${i}`,
          companyId: company.id,
          parentId,
        });
        categories.push(category);
        parentId = category.id;
      }

      // Verify levels
      for (let i = 0; i < 5; i++) {
        expect(categories[i].level).toBe(i);
        expect(categories[i].depth).toBe(i);
      }
    });
  });

  describe('Category operations with hierarchy', () => {
    it('should move category to different parent', async () => {
      const company = await testHelper.createTestCompany();

      // Create hierarchy: Root -> Child1 -> Grandchild1
      const root = await categoryService.create({
        name: 'Root',
        code: 'ROOT',
        companyId: company.id,
      });

      const child1 = await categoryService.create({
        name: 'Child 1',
        code: 'C1',
        companyId: company.id,
        parentId: root.id,
      });

      const grandchild1 = await categoryService.create({
        name: 'Grandchild 1',
        code: 'GC1',
        companyId: company.id,
        parentId: child1.id,
      });

      // Create another branch: Root -> Child2
      const child2 = await categoryService.create({
        name: 'Child 2',
        code: 'C2',
        companyId: company.id,
        parentId: root.id,
      });

      // Move grandchild1 to be under child2
      const moved = await categoryService.update(grandchild1.id, {
        parentId: child2.id,
      });

      expect(moved.parentId).toBe(child2.id);
      expect(moved.path).toBe('Root/Child 2/Grandchild 1');
      expect(moved.level).toBe(2); // Root(0) -> Child2(1) -> Grandchild1(2)
    });

    it('should update category name and refresh path', async () => {
      const company = await testHelper.createTestCompany();

      const parent = await categoryService.create({
        name: 'Old Parent',
        code: 'PARENT',
        companyId: company.id,
      });

      const child = await categoryService.create({
        name: 'Old Child',
        code: 'CHILD',
        companyId: company.id,
        parentId: parent.id,
      });

      // Update parent name
      const updatedParent = await categoryService.update(parent.id, {
        name: 'New Parent',
      });

      // Child's path should be updated automatically
      const updatedChild = await categoryService.findById(child.id);

      expect(updatedParent.path).toBe('New Parent');
      expect(updatedChild.path).toBe('New Parent/Old Child');
    });

    it('should allow multiple children under same parent', async () => {
      const company = await testHelper.createTestCompany();

      const parent = await categoryService.create({
        name: 'Parent',
        code: 'PARENT',
        companyId: company.id,
      });

      // Create multiple children
      const child1 = await categoryService.create({
        name: 'Child 1',
        code: 'C1',
        companyId: company.id,
        parentId: parent.id,
      });

      const child2 = await categoryService.create({
        name: 'Child 2',
        code: 'C2',
        companyId: company.id,
        parentId: parent.id,
      });

      const child3 = await categoryService.create({
        name: 'Child 3',
        code: 'C3',
        companyId: company.id,
        parentId: parent.id,
      });

      // Verify all children have correct parent and level
      expect(child1.parentId).toBe(parent.id);
      expect(child1.level).toBe(1);
      expect(child2.parentId).toBe(parent.id);
      expect(child2.level).toBe(1);
      expect(child3.parentId).toBe(parent.id);
      expect(child3.level).toBe(1);

      // Verify paths
      expect(child1.path).toBe('Parent/Child 1');
      expect(child2.path).toBe('Parent/Child 2');
      expect(child3.path).toBe('Parent/Child 3');
    });

    it('should prevent duplicate category codes in same company', async () => {
      const company = await testHelper.createTestCompany();

      // Create first category
      await categoryService.create({
        name: 'Category 1',
        code: 'CAT001',
        companyId: company.id,
      });

      // Try to create second category with same code - should fail
      await expect(categoryService.create({
        name: 'Category 2',
        code: 'CAT001', // Same code
        companyId: company.id,
      })).rejects.toThrow('Category code already exists');
    });

    it('should allow duplicate codes in different companies', async () => {
      const company1 = await testHelper.createTestCompany();
      const company2 = await testHelper.createTestCompany();

      // Create category in company 1
      await categoryService.create({
        name: 'Category 1',
        code: 'CAT001',
        companyId: company1.id,
      });

      // Create category in company 2 with same code - should succeed
      const category2 = await categoryService.create({
        name: 'Category 2',
        code: 'CAT001', // Same code but different company
        companyId: company2.id,
      });

      expect(category2).toBeDefined();
    });
  });

  describe('Category tree operations', () => {
    it('should get full category tree with hierarchy', async () => {
      const company = await testHelper.createTestCompany();

      // Create tree structure
      const root = await categoryService.create({
        name: 'Root',
        code: 'ROOT',
        companyId: company.id,
      });

      const child1 = await categoryService.create({
        name: 'Child 1',
        code: 'C1',
        companyId: company.id,
        parentId: root.id,
      });

      const child2 = await categoryService.create({
        name: 'Child 2',
        code: 'C2',
        companyId: company.id,
        parentId: root.id,
      });

      const grandchild1 = await categoryService.create({
        name: 'Grandchild 1',
        code: 'GC1',
        companyId: company.id,
        parentId: child1.id,
      });

      const grandchild2 = await categoryService.create({
        name: 'Grandchild 2',
        code: 'GC2',
        companyId: company.id,
        parentId: child1.id,
      });

      // Get full tree
      const tree = await categoryService.getTree(company.id);

      expect(tree.length).toBe(1); // Only one root
      expect(tree[0].id).toBe(root.id);
      expect(tree[0].children).toBeDefined();
      expect(tree[0].children.length).toBe(2);

      // Verify children
      const child1InTree = tree[0].children.find(c => c.id === child1.id);
      const child2InTree = tree[0].children.find(c => c.id === child2.id);

      expect(child1InTree).toBeDefined();
      expect(child2InTree).toBeDefined();
      expect(child1InTree.children.length).toBe(2);
      expect(child2InTree.children.length).toBe(0);

      // Verify grandchildren
      const grandchild1InTree = child1InTree.children.find(c => c.id === grandchild1.id);
      const grandchild2InTree = child1InTree.children.find(c => c.id === grandchild2.id);

      expect(grandchild1InTree).toBeDefined();
      expect(grandchild2InTree).toBeDefined();
    });

    it('should get flat list of categories with parent info', async () => {
      const company = await testHelper.createTestCompany();

      // Create hierarchy
      const root = await categoryService.create({
        name: 'Root',
        code: 'ROOT',
        companyId: company.id,
      });

      const child = await categoryService.create({
        name: 'Child',
        code: 'CHILD',
        companyId: company.id,
        parentId: root.id,
      });

      // Get flat list
      const flatList = await categoryService.getFlatList(company.id);

      expect(flatList.length).toBe(2);

      // Verify root category
      const rootInList = flatList.find(c => c.id === root.id);
      expect(rootInList).toBeDefined();
      expect(rootInList.level).toBe(0);
      expect(rootInList.depth).toBe(0);
      expect(rootInList.parentId).toBeNull();

      // Verify child category
      const childInList = flatList.find(c => c.id === child.id);
      expect(childInList).toBeDefined();
      expect(childInList.level).toBe(1);
      expect(childInList.depth).toBe(1);
      expect(childInList.parentId).toBe(root.id);
    });

    it('should get category by path', async () => {
      const company = await testHelper.createTestCompany();

      // Create hierarchy
      const root = await categoryService.create({
        name: 'Electronics',
        code: 'ELEC',
        companyId: company.id,
      });

      const phones = await categoryService.create({
        name: 'Mobile Phones',
        code: 'MOBILE',
        companyId: company.id,
        parentId: root.id,
      });

      const smartphones = await categoryService.create({
        name: 'Smartphones',
        code: 'SMART',
        companyId: company.id,
        parentId: phones.id,
      });

      // Get by path
      const found = await categoryService.findByPath('Electronics/Mobile Phones/Smartphones');

      expect(found).toBeDefined();
      expect(found.id).toBe(smartphones.id);
      expect(found.path).toBe('Electronics/Mobile Phones/Smartphones');
    });

    it('should return null for non-existent path', async () => {
      const company = await testHelper.createTestCompany();

      const found = await categoryService.findByPath('Non/Existent/Path');
      expect(found).toBeNull();
    });

    it('should get root categories only', async () => {
      const company = await testHelper.createTestCompany();

      // Create root categories
      const root1 = await categoryService.create({
        name: 'Root 1',
        code: 'R1',
        companyId: company.id,
      });

      const root2 = await categoryService.create({
        name: 'Root 2',
        code: 'R2',
        companyId: company.id,
      });

      // Create child category
      await categoryService.create({
        name: 'Child',
        code: 'CHILD',
        companyId: company.id,
        parentId: root1.id,
      });

      // Get root categories
      const roots = await categoryService.getRootCategories(company.id);

      expect(roots.length).toBe(2);
      expect(roots.every(r => r.level === 0)).toBe(true);
      expect(roots.some(r => r.id === root1.id)).toBe(true);
      expect(roots.some(r => r.id === root2.id)).toBe(true);
    });
  });

  describe('Category validation', () => {
    it('should validate category code format', () => {
      const invalidCodes = [
        '', // Empty
        '   ', // Whitespace only
        'A', // Too short
        'A'.repeat(21), // Too long (max 20)
        'CODE WITH SPACES', // Contains spaces
        'CODE-WITH-HYPHENS', // Contains hyphens
        'CODE@WITH@SPECIAL', // Contains special chars
      ];

      for (const code of invalidCodes) {
        expect(() => validateCategoryCode(code)).toThrow(BadRequestException);
      }

      const validCodes = [
        'CAT001',
        'AB',
        'ABC123',
        'CODE',
        'A1B2C3',
        'CODE_CODE',
        'CODE.CODE',
      ];

      for (const code of validCodes) {
        expect(() => validateCategoryCode(code)).not.toThrow();
      }
    });

    it('should validate category name requirements', () => {
      const invalidNames = [
        '', // Empty
        '   ', // Whitespace only
        'A', // Too short
        'A'.repeat(101), // Too long (max 100)
      ];

      for (const name of invalidNames) {
        expect(() => validateCategoryName(name)).toThrow(BadRequestException);
      }

      const validNames = [
        'Category',
        'Test Category',
        'Category with spaces',
        'A'.repeat(100),
      ];

      for (const name of validNames) {
        expect(() => validateCategoryName(name)).not.toThrow();
      }
    });

    it('should prevent creating category with non-existent parent', async () => {
      const company = await testHelper.createTestCompany();

      await expect(categoryService.create({
        name: 'Child',
        code: 'CHILD',
        companyId: company.id,
        parentId: 'non-existent-parent-id',
      })).rejects.toThrow(NotFoundException);
    });

    it('should prevent creating category in different company than parent', async () => {
      const company1 = await testHelper.createTestCompany();
      const company2 = await testHelper.createTestCompany();

      // Create parent in company 1
      const parent = await categoryService.create({
        name: 'Parent',
        code: 'PARENT',
        companyId: company1.id,
      });

      // Try to create child in company 2 with parent from company 1
      await expect(categoryService.create({
        name: 'Child',
        code: 'CHILD',
        companyId: company2.id,
        parentId: parent.id,
      })).rejects.toThrow('Parent category must belong to same company');
    });
  });
});

// Helper functions
function validateCategoryCode(code: string): void {
  if (!code || code.trim().length === 0) {
    throw new BadRequestException('Category code is required');
  }

  if (code.length < 2 || code.length > 20) {
    throw new BadRequestException('Category code must be between 2 and 20 characters');
  }

  if (!/^[A-Z0-9_]+$/.test(code)) {
    throw new BadRequestException('Category code can only contain letters, numbers, and underscores');
  }
}

function validateCategoryName(name: string): void {
  if (!name || name.trim().length === 0) {
    throw new BadRequestException('Category name is required');
  }

  if (name.length < 2 || name.length > 100) {
    throw new BadRequestException('Category name must be between 2 and 100 characters');
  }
}