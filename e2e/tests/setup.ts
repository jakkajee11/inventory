import { test as setup } from '@playwright/test';

/**
 * Global test setup for E2E tests
 *
 * This setup file runs before all tests and provides:
 * - Authentication helpers
 * - Environment configuration
 * - Custom fixtures
 */

// Setup authentication for tests
setup('authenticate', async ({ page }) => {
  // Add auth token to localStorage before page loads
  await page.context().addInitScript(() => {
    // Clear any existing auth data
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
  });

  // Configure interceptors for API requests
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const headers = request.headers();

    // Add authorization header if token exists
    if (localStorage.getItem('auth-token')) {
      headers['Authorization'] = `Bearer ${localStorage.getItem('auth-token')}`;
    }

    // Continue with modified headers
    await route.continue({ headers });
  });
});

// Setup environment variables
setup('setup environment', async ({ page }) => {
  // Set viewport size
  await page.setViewportSize({ width: 1280, height: 720 });

  // Enable console logging
  page.on('console', (msg) => {
    console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
  });

  // Handle network errors
  page.on('requestfailed', (request) => {
    console.error(`[Network Error] ${request.url()}: ${request.failure()?.errorText}`);
  });
});