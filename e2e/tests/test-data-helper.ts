import { Page } from '@playwright/test';

/**
 * Test Data Helper for E2E Tests
 *
 * Provides utilities to:
 * - Create test products
 * - Generate unique test IDs
 * - Clean up test data
 * - Manage test entities
 */
export class TestDataHelper {
  constructor(private page: Page) {}

  /**
   * Generate a unique receipt number
   */
  generateReceiptNumber(): string {
    return `TEST-GR-${Date.now()}`;
  }

  /**
   * Generate a unique issue number
   */
  generateIssueNumber(): string {
    return `TEST-GI-${Date.now()}`;
  }

  /**
   * Generate a unique adjustment number
   */
  generateAdjustmentNumber(): string {
    return `TEST-SA-${Date.now()}`;
  }

  /**
   * Generate a unique product name
   */
  generateProductName(): string {
    return `Test Product ${Date.now()}`;
  }

  /**
   * Create a test product via UI
   */
  async createTestProduct(data: {
    name: string;
    sku: string;
    category?: string;
    unit?: string;
    purchasePrice: number;
    minStock?: number;
  }) {
    await this.page.click('text="Products"');
    await this.page.click('button:has-text("New Product")');

    await this.page.fill('input[placeholder="Product name"]', data.name);
    await this.page.fill('input[placeholder="SKU"]', data.sku);

    if (data.category) {
      await this.page.selectOption('select[name="categoryId"]', data.category);
    }

    if (data.unit) {
      await this.page.selectOption('select[name="unitId"]', data.unit);
    }

    await this.page.fill('input[placeholder="Unit price"]', data.purchasePrice.toString());

    if (data.minStock !== undefined) {
      await this.page.fill('input[placeholder="Minimum stock"]', data.minStock.toString());
    }

    await this.page.fill('textarea[placeholder="Description"]', 'Test product for E2E');
    await this.page.click('button:has-text("Create Product")');

    // Wait for creation to complete
    await this.page.waitForSelector('text=Product created successfully');
    console.log(`✅ Test product created: ${data.name}`);
  }

  /**
   * Create a test supplier via UI
   */
  async createTestSupplier(name: string) {
    await this.page.click('text="Suppliers"');
    await this.page.click('button:has-text("New Supplier")');

    await this.page.fill('input[placeholder="Supplier name"]', name);
    await this.page.fill('input[placeholder="Contact email"]', `${name.toLowerCase().replace(' ', '.')}@test.com`);
    await this.page.fill('input[placeholder="Contact phone"]', '1234567890');
    await this.page.fill('textarea[placeholder="Address"]', '123 Test Street, Test City');
    await this.page.fill('input[placeholder="Notes"]', 'Test supplier for E2E');

    await this.page.click('button:has-text("Create Supplier")');

    // Wait for creation to complete
    await this.page.waitForSelector('text=Supplier created successfully');
    console.log(`✅ Test supplier created: ${name}`);
  }

  /**
   * Clean up test data by navigating to cleanup endpoint
   */
  async cleanupTestData() {
    // This would call an API endpoint to clean up test data
    // For now, we'll just log the action
    console.log('🧹 Cleaning up test data...');

    // In a real implementation, this might be:
    // await this.page.request.post('/api/test/cleanup');
  }

  /**
   * Wait for stock update for a specific product
   */
  async waitForStockUpdate(productName: string, expectedQuantity: number, timeout = 10000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const quantity = await this.page.locator(`text=${productName}`)
        .locator('..')
        .locator(`text=${expectedQuantity}`)
        .isVisible();

      if (quantity) {
        console.log(`✅ Stock updated: ${productName} = ${expectedQuantity}`);
        return;
      }

      await this.page.waitForTimeout(500);
    }

    throw new Error(`Timeout waiting for stock update: ${productName} = ${expectedQuantity}`);
  }

  /**
   * Get current stock quantity for a product
   */
  async getCurrentStock(productName: string): Promise<number> {
    await this.page.fill('input[placeholder="Search products..."]', productName);
    await this.page.waitForSelector(`text=${productName}`);

    const stockText = await this.page.locator(`text=${productName}`)
      .locator('..')
      .locator('text=/\\d+/')
      .textContent();

    if (!stockText) {
      throw new Error(`Could not find stock quantity for ${productName}`);
    }

    return parseInt(stockText.trim());
  }

  /**
   * Navigate to a specific entity list with search
   */
  async navigateToList(entity: 'products' | 'suppliers' | 'goods-receipts' | 'goods-issues' | 'stock-adjustments') {
    const entityMap = {
      'products': 'Products',
      'suppliers': 'Suppliers',
      'goods-receipts': 'Goods Receipts',
      'goods-issues': 'Goods Issues',
      'stock-adjustments': 'Stock Adjustments'
    };

    await this.page.click(`text=${entityMap[entity]}`);
    await this.page.waitForURL(`/dashboard/${entity}`);
  }
}

/**
 * Factory function to create TestDataHelper instance
 */
export function createTestDataHelper(page: Page) {
  return new TestDataHelper(page);
}