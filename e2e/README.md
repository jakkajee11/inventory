# E2E Testing with Playwright

This directory contains End-to-End (E2E) tests for the Inventory Management System using Playwright.

## Test Structure

```
e2e/
├── playwright.config.ts          # Playwright configuration
├── tests/
│   ├── setup.ts                 # Test setup and configuration
│   ├── global-setup.ts           # Global setup before all tests
│   ├── auth-helper.ts            # Authentication utilities
│   └── workflow/                 # Workflow test suites
│       ├── complete-receipt-workflow.spec.ts
│       ├── complete-issue-workflow.spec.ts
│       ├── stock-adjustment-workflow.spec.ts
│       ├── approval-workflow.spec.ts
│       ├── low-stock-alert.spec.ts
│       └── concurrent-operations.spec.ts
└── README.md                     # This file
```

## Prerequisites

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development servers:
   ```bash
   # Terminal 1: Start API server
   pnpm --filter @inventory/api dev

   # Terminal 2: Start web app
   pnpm --filter @inventory/web dev
   ```

3. Seed the database (if needed):
   ```bash
   pnpm db:generate
   pnpm db:push
   pnpm --filter @inventory/api db:seed
   ```

## Running Tests

### Run all tests
```bash
pnpm test:e2e
```

### Run tests headed (with browser UI visible)
```bash
pnpm test:e2e --headed
```

### Run specific test file
```bash
pnpm test:e2e e2e/tests/workflow/complete-receipt-workflow.spec.ts
```

### Run tests with specific browser
```bash
pnpm test:e2e --project=chromium
pnpm test:e2e --project=Mobile Chrome
```

### Run tests in debug mode
```bash
pnpm test:e2e --debug
```

### Run tests with trace
```bash
pnpm test:e2e --trace on
```

## Test Configuration

The `playwright.config.ts` file includes:
- Base URL: http://localhost:13100
- Web server auto-start for the web app
- Chromium, Mobile Chrome, and iPad browsers
- 30-second timeout
- HTML reporter
- Trace collection on retry

## Default Test User

The tests use the default admin user credentials:
- Email: admin@open-inventory.app
- Password: !Adm!N2026

## Test Data

Tests create temporary data with the following patterns:
- Receipt numbers: TEST-GR-###
- Issue numbers: TEST-GI-###
- Adjustment numbers: TEST-SA-###
- Product names: Test Product ###

## Custom Fixtures

The `auth-helper.ts` provides:
- `loginAsAdmin()`: Login as admin user
- `loginAsManager()`: Login as manager user (if available)
- `loginAsStaff()`: Login as staff user (if available)
- `logout()`: Logout current user
- `isAuthenticated()`: Check if user is authenticated

## Browser Context Setup

The test setup includes:
- Authentication token management
- Request/response interceptors
- Console logging
- Network error handling
- Viewport configuration (1280x720)

## Troubleshooting

### Common Issues

1. **Test failures due to slow network**:
   - Increase timeout in `playwright.config.ts`
   - Add `await page.waitForLoadState('networkidle')` where needed

2. **Authentication issues**:
   - Ensure API server is running
   - Check that auth endpoints are accessible
   - Verify user exists in database

3. **Missing test data**:
   - Run database seeding before tests
   - Check if test users are created

4. **Flaky tests**:
   - Add explicit waits
   - Use test.retry() for unreliable operations
   - Check for race conditions

### Debugging

1. **Visual debugging**:
   ```bash
   pnpm test:e2e --headed
   ```

2. **Pause on failure**:
   ```bash
   pnpm test:e2e --debug
   ```

3. **Generate trace**:
   ```bash
   pnpm test:e2e --trace on
   ```

4. **View test report**:
   ```bash
   # After running tests, open:
   npx playwright show-report
   ```

## Best Practices

1. **Use meaningful test names** that describe the scenario
2. **Follow the page object model** for reusable components
3. **Use explicit waits** instead of fixed delays
4. **Clean up test data** after tests
5. **Test both success and error scenarios**
6. **Use descriptive assertions** with error messages

## Adding New Tests

1. Create a new `.spec.ts` file in the appropriate workflow directory
2. Import `test` and `expect` from `@playwright/test`
3. Use the `auth-helper` for authentication
4. Follow the existing test structure and patterns
5. Add proper cleanup if needed

## Environment Variables

Tests can use environment variables through:
- `process.env.VAR_NAME` in Node.js context
- `process.env` in browser context via `globalSetup`

Example:
```typescript
test('example', async ({ page }) => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:13100';
  await page.goto(baseUrl);
});
```