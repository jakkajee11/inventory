import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for the Inventory Management System E2E tests
 *
 * This configuration sets up Playwright for testing a monorepo with:
 * - Backend API running on http://localhost:3000 (with /api/v1 prefix)
 * - Frontend web app running on http://localhost:13100
 */
export default defineConfig({
  // Test directory
  testDir: './tests',

  // Run tests in files in parallel
  fullyParallel: true,

  // Reporter to use
  reporter: 'html',

  // Global timeout for all tests
  timeout: 30000,

  // Retry settings
  retries: 0,

  // Configure web server (comment out when running manually)
  // webServer: {
  //   command: 'cd .. && pnpm --filter @inventory/web dev',
  //   url: 'http://localhost:13100',
  //   reuseExistingServer: true,
  //   timeout: 120000,
  //   stdout: 'pipe',
  //   stderr: 'pipe',
  // },

  // Shared settings for all the projects below
  use: {
    // Base URL for the web app
    baseURL: 'http://localhost:13100',

    // Global setup
    setupFiles: ['./tests/setup.ts'],

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Take screenshots on failure
    screenshot: 'only-on-failure',

    // Record video on failure
    video: 'retain-on-failure',
  },

  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Test on mobile devices
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },

    // Test on tablet
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] },
    },
  ],

  // Folder for test reports
  outputDir: './test-results/',

  // Folder for traces
  traceDir: './test-results/trace/',

  // Global hooks
  globalSetup: './tests/global-setup.ts',

  // Environment variables
  env: {
    CI: process.env.CI === 'true',
  },
});

// Type definitions for test fixtures
declare module '@playwright/test' {
  interface Fixtures {
    // Add custom fixtures here if needed
  }
}