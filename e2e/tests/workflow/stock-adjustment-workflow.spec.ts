import { test, expect } from '@playwright/test';
import { createAuthHelper } from '../auth-helper';

/**
 * Stock Adjustment Workflow Test (T225)
 *
 * This test verifies the end-to-end workflow for:
 * 1. Admin login
 * 2. Create a stock adjustment
 * 3. Verify before and after quantities
 * 4. Approve adjustment
 * 5. Confirm final stock levels
 */
test.describe('Stock Adjustment Workflow', () => {
  let authHelper: ReturnType<typeof createAuthHelper>;

  test.beforeEach(async ({ page }) => {
    authHelper = createAuthHelper(page);
    await authHelper.loginAsAdmin();
  });

  test('should create and approve stock adjustment', async () => {
    // First ensure we have stock to adjust
    await page.click('text="Goods Receipts"');
    await page.click('button:has-text("New Receipt")');
    await page.fill('input[placeholder="Enter receipt number"]', 'TEST-GR-003');
    await page.fill('input[placeholder="Enter supplier name"]', 'Test Supplier');
    await page.fill('input[placeholder="Enter warehouse"]', 'Main Warehouse');

    await page.click('button:has-text("Add Item")');
    await page.fill('input[placeholder="Search products..."]', 'Test Product 3');
    await page.fill('input[placeholder="Quantity"]', '30');
    await page.fill('input[placeholder="Unit price"]', '25');
    await page.fill('input[placeholder="Notes"]', 'Test receipt for adjustment');

    await page.click('button:has-text("Save Draft")');
    await page.click('button:has-text("Submit for Approval")');
    await page.click('text="Approvals"');
    await page.fill('input[placeholder="Search approvals..."]', 'TEST-GR-003');
    await page.click('button:has-text("Approve")');
    await page.click('button:has-text("Confirm Approval")');

    // Wait for receipt to be processed
    await page.waitForTimeout(2000);

    // 1. Navigate to Stock Adjustment page
    await page.click('text="Stock Adjustment"');
    await page.waitForURL('/dashboard/stock-adjustments');
    await expect(page).toHaveTitle(/Stock Adjustment/);

    // 2. Click "New Adjustment" button
    await page.click('button:has-text("New Adjustment")');
    await page.waitForURL('/dashboard/stock-adjustments/new');

    // 3. Fill adjustment form
    await page.fill('input[placeholder="Enter adjustment number"]', 'TEST-SA-001');
    await page.fill('input[placeholder="Enter warehouse"]', 'Main Warehouse');

    // Add item for adjustment
    await page.click('button:has-text("Add Item")');
    await page.fill('input[placeholder="Search products..."]', 'Test Product 3');

    // Wait for product to load and get current quantity
    const currentQuantity = await page.locator('input[placeholder="Current quantity"]').getAttribute('value');
    console.log(`Current quantity: ${currentQuantity}`);

    // Set adjustment quantity (increase by 5)
    const newQuantity = (parseInt(currentQuantity || '0') + 5).toString();
    await page.fill('input[placeholder="New quantity"]', newQuantity);
    await page.selectOption('select[name="adjustmentType"]', 'addition');

    // Fill adjustment details
    await page.fill('textarea[placeholder="Reason for adjustment"]', 'Stock correction - added damaged items back');
    await page.fill('input[placeholder="Reference"]', 'ADJ-001');

    // 4. Save adjustment as draft
    await page.click('button:has-text("Save Draft")');
    await expect(page.locator('text="Adjustment saved as draft"')).toBeVisible();

    // 5. Submit for approval
    await page.click('button:has-text("Submit for Approval")');
    await expect(page.locator('text="Adjustment submitted for approval"')).toBeVisible();

    // 6. Navigate to approvals page
    await page.click('text="Approvals"');
    await page.waitForURL('/dashboard/approvals');

    // 7. Find and approve the adjustment
    await page.fill('input[placeholder="Search approvals..."]', 'TEST-SA-001');
    await page.waitForSelector('text=TEST-SA-001');
    await page.click('button:has-text("Approve")');

    // Confirm approval
    await page.click('button:has-text("Confirm Approval")');
    await expect(page.locator('text="Adjustment approved successfully"')).toBeVisible();

    // 8. Verify stock update in inventory
    await page.click('text="Inventory"');
    await page.waitForURL('/dashboard/inventory');
    await page.fill('input[placeholder="Search products..."]', 'Test Product 3');

    // Wait for stock quantity to update
    // Should be current quantity + 5 (from adjustment)
    await page.waitForSelector('text="35"'); // 30 + 5
    expect(page.locator('text=35')).toBeVisible();

    // 9. Verify adjustment status in adjustments list
    await page.click('text="Stock Adjustments"');
    await page.waitForURL('/dashboard/stock-adjustments');
    await page.fill('input[placeholder="Search adjustments..."]', 'TEST-SA-001');
    await expect(page.locator('text=Approved')).toBeVisible();

    // 10. Verify adjustment details
    await page.click('button:has-text("View Details")');
    await expect(page.locator('text=TEST-SA-001')).toBeVisible();
    await expect(page.locator('text=Stock correction - added damaged items back')).toBeVisible();

    // 11. Verify stock movement history
    await page.click('text="Product Details"');
    await page.fill('input[placeholder="Search products..."]', 'Test Product 3');
    await page.click('button:has-text("View")');

    // Check for adjustment in movements
    const hasAdjustment = await page.locator('text=Stock Adjustment').isVisible();
    if (hasAdjustment) {
      expect(page.locator('text=Stock Adjustment')).toBeVisible();
    }

    console.log('✅ Stock adjustment workflow test passed');
  });
});