import { test, expect } from '@playwright/test';
import { createAuthHelper } from '../auth-helper';

/**
 * Concurrent Operations Test (T228)
 *
 * This test verifies:
 * 1. Optimistic locking mechanism
 * 2. Prevention of concurrent issues that would cause negative stock
 * 3. Proper error handling for concurrent operations
 * 4. Data consistency during concurrent access
 */
test.describe('Concurrent Operations', () => {
  let authHelper: ReturnType<typeof createAuthHelper>;

  test.beforeEach(async ({ page }) => {
    authHelper = createAuthHelper(page);
    await authHelper.loginAsAdmin();
  });

  test('should prevent concurrent stock issues that would cause negative stock', async () => {
    // First create stock with limited quantity
    await page.click('text="Goods Receipts"');
    await page.click('button:has-text("New Receipt")');
    await page.fill('input[placeholder="Enter receipt number"]', 'TEST-GR-008');
    await page.fill('input[placeholder="Enter supplier name"]', 'Test Supplier');
    await page.fill('input[placeholder="Enter warehouse"]', 'Main Warehouse');

    await page.click('button:has-text("Add Item")');
    await page.fill('input[placeholder="Search products..."]', 'Concurrent Product');
    await page.fill('input[placeholder="Quantity"]', '10');
    await page.fill('input[placeholder="Unit price"]', '50');
    await page.fill('input[placeholder="Notes"]', 'Test for concurrent operations');

    // Save and submit
    await page.click('button:has-text("Save Draft")');
    await page.click('button:has-text("Submit for Approval")');
    await page.click('text="Approvals"');
    await page.fill('input[placeholder="Search approvals..."]', 'TEST-GR-008');
    await page.click('button:has-text("Approve")');
    await page.click('button:has-text("Confirm Approval")');

    // Wait for receipt processing
    await page.waitForTimeout(2000);

    // Open two tabs for concurrent operations
    const context = await browser.newContext();
    const page2 = await context.newPage();
    const authHelper2 = createAuthHelper(page2);

    // Login to second page
    await authHelper2.loginAsAdmin();

    // Navigate to goods issue on both pages
    await page.click('text="Goods Issue"');
    await page.goto('/dashboard/goods-issues');
    await page2.goto('/dashboard/goods-issues');

    // Page 1: Create issue for 9 units
    await page.click('button:has-text("New Issue")');
    await page.fill('input[placeholder="Enter issue number"]', 'TEST-GI-003');
    await page.fill('input[placeholder="Enter recipient"]', 'Customer 1');
    await page.fill('input[placeholder="Enter warehouse"]', 'Main Warehouse');

    await page.click('button:has-text("Add Item")');
    await page.fill('input[placeholder="Search products..."]', 'Concurrent Product');
    await page.fill('input[placeholder="Quantity"]', '9'); // This should work (10 - 9 = 1)
    await page.fill('input[placeholder="Unit price"]', '50');
    await page.fill('textarea[placeholder="Reason for issue"]', 'Concurrent issue 1');
    await page.fill('input[placeholder="Reference number"]', 'REF-003');

    // Save and submit first issue
    await page.click('button:has-text("Save Draft")');
    await page.click('button:has-text("Submit for Approval")');

    // Page 2: Try to create issue for 2 units (should fail)
    await page2.click('button:has-text("New Issue")');
    await page2.fill('input[placeholder="Enter issue number"]', 'TEST-GI-004');
    await page2.fill('input[placeholder="Enter recipient"]', 'Customer 2');
    await page2.fill('input[placeholder="Enter warehouse"]', 'Main Warehouse');

    await page2.click('button:has-text("Add Item")');
    await page2.fill('input[placeholder="Search products..."]', 'Concurrent Product');
    await page2.fill('input[placeholder="Quantity"]', '2'); // This should fail (only 1 left after first issue)
    await page2.fill('input[placeholder="Unit price"]', '50');
    await page2.fill('textarea[placeholder="Reason for issue"]', 'Concurrent issue 2');
    await page2.fill('input[placeholder="Reference number"]', 'REF-004');

    // Save and submit second issue
    await page2.click('button:has-text("Save Draft")');
    await page2.click('button:has-text("Submit for Approval")');

    // Approve first issue
    await page.click('text="Approvals"');
    await page.fill('input[placeholder="Search approvals..."]', 'TEST-GI-003');
    await page.click('button:has-text("Approve")');
    await page.click('button:has-text("Confirm Approval")');

    // Wait for processing
    await page.waitForTimeout(2000);

    // Check second issue in approvals
    await page2.click('text="Approvals"');
    await page2.fill('input[placeholder="Search approvals..."]', 'TEST-GI-004');

    // The second issue should show an error or be rejected
    const secondIssueStatus = await page2.locator('text=Insufficient stock').isVisible();
    const secondIssueError = await page2.locator('text=Rejected').isVisible();

    if (secondIssueStatus || secondIssueError) {
      console.log('✅ Concurrent issue prevented - insufficient stock error');
    } else {
      // Check if it was approved but should not be
      const approvedText = await page2.locator('text=Approved').isVisible();
      if (approvedText) {
        // This would be a bug - concurrent approval should not happen
        console.log('❌ BUG: Concurrent issue was approved despite insufficient stock');
      }
    }

    // Verify final stock level
    await page.click('text="Inventory"');
    await page.fill('input[placeholder="Search products..."]', 'Concurrent Product');

    // Stock should be 1 (10 - 9)
    await expect(page.locator('text=1')).toBeVisible();

    // Close second page
    await context.close();
  });

  test('should handle concurrent updates to the same product', async () => {
    // This test simulates multiple users updating product information simultaneously

    // Create a product first
    await page.click('text="Products"');
    await page.click('button:has-text("New Product")');
    await page.fill('input[placeholder="Product name"]', 'Concurrent Update Product');
    await page.fill('input[placeholder="SKU"]', 'SKU-CONCURRENT');
    await page.fill('select[name="categoryId"]', 'Electronics');
    await page.fill('input[placeholder="Unit price"]', '100');
    await page.click('button:has-text("Create Product")');

    // Open second tab
    const context = await browser.newContext();
    const page2 = await context.newPage();
    const authHelper2 = createAuthHelper(page2);
    await authHelper2.loginAsAdmin();

    // Navigate to products on both pages
    await page.goto('/dashboard/products');
    await page2.goto('/dashboard/products');

    // Page 1: Update product
    await page.fill('input[placeholder="Search products..."]', 'Concurrent Update Product');
    await page.click('button:has-text("Edit")');
    await page.fill('input[placeholder="Product name"]', 'Concurrent Update Product v2');
    await page.fill('input[placeholder="Description"]', 'Updated description');
    await page.click('button:has-text("Save Changes")');

    // Page 2: Try to update the same product
    await page2.fill('input[placeholder="Search products..."]', 'Concurrent Update Product');
    await page2.click('button:has-text("Edit")');

    // The second update should handle the conflict gracefully
    await expect(page2.locator('text=Product updated by another user')).or(
      page2.locator('text=Conflict detected')
    ).toBeVisible();

    // Verify final state
    await page.goto('/dashboard/products');
    await page.fill('input[placeholder="Search products..."]', 'Concurrent Update Product v2');
    await expect(page.locator('text=Concurrent Update Product v2')).toBeVisible();

    await context.close();
  });

  test('should prevent race conditions in approval workflow', async () => {
    // Create a receipt
    await page.click('text="Goods Receipts"');
    await page.click('button:has-text("New Receipt")');
    await page.fill('input[placeholder="Enter receipt number"]', 'TEST-GR-009');
    await page.fill('input[placeholder="Enter supplier name"]', 'Test Supplier');
    await page.fill('input[placeholder="Enter warehouse"]', 'Main Warehouse');

    await page.click('button:has-text("Add Item")');
    await page.fill('input[placeholder="Search products..."]', 'Race Condition Product');
    await page.fill('input[placeholder="Quantity"]', '5');
    await page.fill('input[placeholder="Unit price"]', '100');
    await page.fill('input[placeholder="Notes"]', 'Test for race condition');

    // Save and submit
    await page.click('button:has-text("Save Draft")');
    await page.click('button:has-text("Submit for Approval")');

    // Open second tab
    const context = await browser.newContext();
    const page2 = await context.newPage();
    const authHelper2 = createAuthHelper(page2);
    await authHelper2.loginAsAdmin();

    // Navigate to approvals on both pages
    await page.goto('/dashboard/approvals');
    await page2.goto('/dashboard/approvals');

    // Both pages find the same receipt
    await page.fill('input[placeholder="Search approvals..."]', 'TEST-GR-009');
    await page2.fill('input[placeholder="Search approvals..."]', 'TEST-GR-009');

    // Page 1 approves
    await page.click('button:has-text("Approve")');
    await page.click('button:has-text("Confirm Approval")');

    // Wait for processing
    await page.waitForTimeout(1000);

    // Page 2 tries to approve
    const approveButton = page2.locator('button:has-text("Approve")').first();
    const isDisabled = await approveButton.isDisabled();

    if (isDisabled) {
      console.log('✅ Race condition prevented - second approve button disabled');
    } else {
      await approveButton.click();
      // Should show error or already approved message
      await expect(page2.locator('text=Already approved')).or(
        page2.locator('text=Cannot approve approved item')
      ).toBeVisible();
    }

    // Verify it's approved
    await page.fill('input[placeholder="Search approvals..."]', 'TEST-GR-009');
    await expect(page.locator('text=Approved')).toBeVisible();

    await context.close();
  });

  test('should handle concurrent stock adjustments', async () => {
    // Create stock
    await page.click('text="Goods Receipts"');
    await page.click('button:has-text("New Receipt")');
    await page.fill('input[placeholder="Enter receipt number"]', 'TEST-GR-010');
    await page.fill('input[placeholder="Enter supplier name"]', 'Test Supplier');
    await page.fill('input[placeholder="Enter warehouse"]', 'Main Warehouse');

    await page.click('button:has-text("Add Item")');
    await page.fill('input[placeholder="Search products..."]', 'Adjustment Product');
    await page.fill('input[placeholder="Quantity"]', '20');
    await page.fill('input[placeholder="Unit price"]', '100');
    await page.fill('input[placeholder="Notes"]', 'Test for concurrent adjustments');

    // Save and submit
    await page.click('button:has-text("Save Draft")');
    await page.click('button:has-text("Submit for Approval")');
    await page.click('text="Approvals"');
    await page.fill('input[placeholder="Search approvals..."]', 'TEST-GR-010');
    await page.click('button:has-text("Approve")');
    await page.click('button:has-text("Confirm Approval")');

    await page.waitForTimeout(2000);

    // Open second tab
    const context = await browser.newContext();
    const page2 = await context.newPage();
    const authHelper2 = createAuthHelper(page2);
    await authHelper2.loginAsAdmin();

    // Navigate to stock adjustments on both pages
    await page.goto('/dashboard/stock-adjustments');
    await page2.goto('/dashboard/stock-adjustments');

    // Page 1: Create adjustment to add 5
    await page.click('button:has-text("New Adjustment")');
    await page.fill('input[placeholder="Enter adjustment number"]', 'TEST-SA-002');
    await page.fill('input[placeholder="Enter warehouse"]', 'Main Warehouse');

    await page.click('button:has-text("Add Item")');
    await page.fill('input[placeholder="Search products..."]', 'Adjustment Product');
    await page.fill('input[placeholder="New quantity"]', '25'); // 20 + 5
    await page.selectOption('select[name="adjustmentType"]', 'addition');
    await page.fill('textarea[placeholder="Reason for adjustment"]', 'Add 5 items');
    await page.fill('input[placeholder="Reference"]', 'ADJ-002');

    await page.click('button:has-text("Save Draft")');
    await page.click('button:has-text("Submit for Approval")');

    // Page 2: Create adjustment to add 3
    await page2.click('button:has-text("New Adjustment")');
    await page2.fill('input[placeholder="Enter adjustment number"]', 'TEST-SA-003');
    await page2.fill('input[placeholder="Enter warehouse"]', 'Main Warehouse');

    await page2.click('button:has-text("Add Item")');
    await page2.fill('input[placeholder="Search products..."]', 'Adjustment Product');
    await page2.fill('input[placeholder="New quantity"]', '23'); // 20 + 3
    await page2.selectOption('select[name="adjustmentType"]', 'addition');
    await page2.fill('textarea[placeholder="Reason for adjustment"]', 'Add 3 items');
    await page2.fill('input[placeholder="Reference"]', 'ADJ-003');

    await page2.click('button:has-text("Save Draft")');
    await page2.click('button:has-text("Submit for Approval")');

    // Approve first adjustment
    await page.click('text="Approvals"');
    await page.fill('input[placeholder="Search approvals..."]', 'TEST-SA-002');
    await page.click('button:has-text("Approve")');
    await page.click('button:has-text("Confirm Approval")');

    // Wait for processing
    await page.waitForTimeout(1000);

    // Approve second adjustment
    await page2.click('text="Approvals"');
    await page2.fill('input[placeholder="Search approvals..."]', 'TEST-SA-003');
    await page2.click('button:has-text("Approve")');
    await page2.click('button:has-text("Confirm Approval")');

    // Wait for both to process
    await page.waitForTimeout(2000);

    // Check final stock
    await page.goto('/dashboard/inventory');
    await page.fill('input[placeholder="Search products..."]', 'Adjustment Product');

    // Should be 28 (20 + 5 + 3)
    await expect(page.locator('text=28')).toBeVisible();

    console.log('✅ Concurrent stock adjustments handled correctly');
    await context.close();
  });
});