import { chromium, type FullConfig } from '@playwright/test';

/**
 * Global setup before all tests
 *
 * This runs once before the entire test suite and:
 * - Creates a browser instance
 * - Sets up the first test user
 */
async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Initialize the database with test data
  try {
    console.log('🗃️  Setting up test environment...');

    // Wait for web server to be ready with retries
    let retryCount = 0;
    let isServerReady = false;

    while (retryCount < 5 && !isServerReady) {
      try {
        await page.goto('http://localhost:13100/login', { timeout: 10000 });
        await page.waitForLoadState('domcontentloaded', { timeout: 10000 });

        // Check if we see the login form
        const loginForm = await page.locator('input[type="email"]').isVisible();
        if (loginForm) {
          isServerReady = true;
          console.log('✅ Web server is ready');
        }
      } catch (error) {
        retryCount++;
        console.log(`⚠️  Server not ready, retrying (${retryCount}/5)...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    if (!isServerReady) {
      throw new Error('Web server failed to start after multiple attempts');
    }

    // No need to create admin user as it's already seeded

    // Close browser
    await browser.close();

    console.log('🎉 Global setup completed');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    await browser.close();
    process.exit(1);
  }
}

export default globalSetup;