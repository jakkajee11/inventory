import { test, expect } from '@playwright/test';

/**
 * Basic Navigation Test
 *
 * This test verifies that the application can load and navigate to basic pages
 */
test.describe('Basic Navigation', () => {
  test('should load login page', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Check if login form is present
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('text=Welcome Back')).toBeVisible();
  });

  test('should show login error with invalid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Fill with invalid credentials
    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Wait for error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
  });

  test('should redirect to login when accessing dashboard without authentication', async ({ page }) => {
    // Try to access dashboard directly
    await page.goto('/dashboard');

    // Should be redirected to login
    await expect(page).toHaveURL('/login');
  });

  test('should have page title on login page', async ({ page }) => {
    await page.goto('/login');

    // Check page title
    await expect(page).toHaveTitle(/Login/);
  });
});