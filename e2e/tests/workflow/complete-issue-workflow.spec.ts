import { test, expect } from '@playwright/test';
import { createAuthHelper } from '../auth-helper';

/**
 * Complete Goods Issue Workflow Test (T224)
 *
 * This test verifies the end-to-end workflow for:
 * 1. Admin login
 * 2. Navigate to Goods Issue creation
 * 3. Create a new goods issue
 * 4. Submit for approval
 * 5. Approve the issue
 * 6. Verify stock decrease
 */
test.describe('Complete Goods Issue Workflow', () => {
  let authHelper: ReturnType<typeof createAuthHelper>;

  test.beforeEach(async ({ page }) => {
    authHelper = createAuthHelper(page);
    await authHelper.loginAsAdmin();
  });

  test('should complete full goods issue workflow', async () => {
    // First ensure we have stock to issue
    await page.click('text="Goods Receipts"');
    await page.click('button:has-text("New Receipt")');
    await page.fill('input[placeholder="Enter receipt number"]', 'TEST-GR-002');
    await page.fill('input[placeholder="Enter supplier name"]', 'Test Supplier');
    await page.fill('input[placeholder="Enter warehouse"]', 'Main Warehouse');

    await page.click('button:has-text("Add Item")');
    await page.fill('input[placeholder="Search products..."]', 'Test Product 2');
    await page.fill('input[placeholder="Quantity"]', '20');
    await page.fill('input[placeholder="Unit price"]', '50');
    await page.fill('input[placeholder="Notes"]', 'Test receipt for issue workflow');

    await page.click('button:has-text("Save Draft")');
    await page.click('button:has-text("Submit for Approval")');
    await page.click('text="Approvals"');
    await page.fill('input[placeholder="Search approvals..."]', 'TEST-GR-002');
    await page.click('button:has-text("Approve")');
    await page.click('button:has-text("Confirm Approval")');

    // Wait for receipt to be processed
    await page.waitForTimeout(2000);

    // 1. Navigate to Goods Issue page
    await page.click('text="Goods Issue"');
    await page.waitForURL('/dashboard/goods-issues');
    await expect(page).toHaveTitle(/Goods Issue/);

    // 2. Click "New Issue" button
    await page.click('button:has-text("New Issue")');
    await page.waitForURL('/dashboard/goods-issues/new');

    // 3. Fill issue form
    await page.fill('input[placeholder="Enter issue number"]', 'TEST-GI-001');
    await page.fill('input[placeholder="Enter recipient"]', 'Test Customer');
    await page.fill('input[placeholder="Enter warehouse"]', 'Main Warehouse');

    // Add item details
    await page.click('button:has-text("Add Item")');
    await page.fill('input[placeholder="Search products..."]', 'Test Product 2');
    await page.fill('input[placeholder="Quantity"]', '5');
    await page.fill('input[placeholder="Unit price"]', '50');

    // Fill other required fields
    await page.fill('textarea[placeholder="Reason for issue"]', 'Test issue for automation');
    await page.fill('input[placeholder="Reference number"]', 'REF-001');

    // 4. Save issue as draft
    await page.click('button:has-text("Save Draft")');
    await expect(page.locator('text="Issue saved as draft"')).toBeVisible();

    // 5. Submit for approval
    await page.click('button:has-text("Submit for Approval")');
    await expect(page.locator('text="Issue submitted for approval"')).toBeVisible();

    // 6. Navigate to approvals page
    await page.click('text="Approvals"');
    await page.waitForURL('/dashboard/approvals');

    // 7. Find and approve the issue
    await page.fill('input[placeholder="Search approvals..."]', 'TEST-GI-001');
    await page.waitForSelector('text=TEST-GI-001');
    await page.click('button:has-text("Approve")');

    // Confirm approval
    await page.click('button:has-text("Confirm Approval")');
    await expect(page.locator('text="Issue approved successfully"')).toBeVisible();

    // 8. Verify stock decrease in inventory
    await page.click('text="Inventory"');
    await page.waitForURL('/dashboard/inventory');
    await page.fill('input[placeholder="Search products..."]', 'Test Product 2');

    // Wait for stock quantity to update (should be 15 = 20 - 5)
    await page.waitForSelector('text="15"');
    expect(page.locator('text=15')).toBeVisible();

    // 9. Verify issue status in issues list
    await page.click('text="Goods Issues"');
    await page.waitForURL('/dashboard/goods-issues');
    await page.fill('input[placeholder="Search issues..."]', 'TEST-GI-001');
    await expect(page.locator('text=Approved')).toBeVisible();

    // 10. Verify stock movement history
    await page.click('text="Product Details"');
    await page.fill('input[placeholder="Search products..."]', 'Test Product 2');
    await page.click('button:has-text("View")');

    // Check if we can navigate to movements page
    const movementsLink = page.locator('a:has-text("Movements")');
    if (await movementsLink.isVisible()) {
      await movementsLink.click();
      await expect(page.locator('text=Goods Issue')).toBeVisible();
    }

    console.log('✅ Complete issue workflow test passed');
  });
});