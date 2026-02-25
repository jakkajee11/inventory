import { test, expect } from '@playwright/test';
import { createAuthHelper } from '../auth-helper';

/**
 * Complete Goods Receipt Workflow Test (T223)
 *
 * This test verifies the end-to-end workflow for:
 * 1. Admin login
 * 2. Navigate to Goods Receipt creation
 * 3. Create a new goods receipt
 * 4. Submit for approval
 * 5. Approve the receipt
 * 6. Verify stock increase
 */
test.describe('Complete Goods Receipt Workflow', () => {
  let authHelper: ReturnType<typeof createAuthHelper>;

  test.beforeEach(async ({ page }) => {
    authHelper = createAuthHelper(page);
    await authHelper.loginAsAdmin();
  });

  test('should complete full goods receipt workflow', async () => {
    // 1. Navigate to Goods Receipt page
    await page.click('text=Goods Receipt');
    await page.waitForURL('/dashboard/goods-receipts');
    await expect(page).toHaveTitle(/Goods Receipt/);

    // 2. Click "New Receipt" button
    await page.click('button:has-text("New Receipt")');
    await page.waitForURL('/dashboard/goods-receipts/new');

    // 3. Fill receipt form
    await page.fill('input[placeholder="Enter receipt number"]', 'TEST-GR-001');
    await page.fill('input[placeholder="Enter supplier name"]', 'Test Supplier');
    await page.fill('input[placeholder="Enter warehouse"]', 'Main Warehouse');

    // Add item details
    await page.click('button:has-text("Add Item")');
    await page.fill('input[placeholder="Search products..."]', 'Test Product');
    await page.fill('input[placeholder="Quantity"]', '10');
    await page.fill('input[placeholder="Unit price"]', '100');

    // Fill other required fields
    await page.fill('input[placeholder="Notes"]', 'Test receipt for automation');

    // 4. Save receipt as draft
    await page.click('button:has-text("Save Draft")');
    await expect(page.locator('text="Receipt saved as draft"')).toBeVisible();

    // 5. Submit for approval
    await page.click('button:has-text("Submit for Approval")');
    await expect(page.locator('text="Receipt submitted for approval"')).toBeVisible();

    // 6. Navigate to approvals page
    await page.click('text="Approvals"');
    await page.waitForURL('/dashboard/approvals');

    // 7. Find and approve the receipt
    await page.fill('input[placeholder="Search approvals..."]', 'TEST-GR-001');
    await page.waitForSelector('text=TEST-GR-001');
    await page.click('button:has-text("Approve")');

    // Confirm approval
    await page.click('button:has-text("Confirm Approval")');
    await expect(page.locator('text="Receipt approved successfully"')).toBeVisible();

    // 8. Verify stock increase in inventory
    await page.click('text="Inventory"');
    await page.waitForURL('/dashboard/inventory');
    await page.fill('input[placeholder="Search products..."]', 'Test Product');

    // Wait for stock quantity to update
    await page.waitForSelector('text="10"');
    expect(page.locator('text=10')).toBeVisible();

    // 9. Verify receipt status in receipts list
    await page.click('text="Goods Receipts"');
    await page.waitForURL('/dashboard/goods-receipts');
    await page.fill('input[placeholder="Search receipts..."]', 'TEST-GR-001');
    await expect(page.locator('text=Approved')).toBeVisible();

    console.log('✅ Complete receipt workflow test passed');
  });
});