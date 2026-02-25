# Starting E2E Tests

## Prerequisites

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the API server:
   ```bash
   pnpm --filter @inventory/api dev
   ```

3. Start the web app (in a separate terminal):
   ```bash
   pnpm --filter @inventory/web dev
   ```

4. Ensure the database is seeded:
   ```bash
   pnpm db:generate
   pnpm db:push
   pnpm --filter @inventory/api db:seed
   ```

## Running Tests

After starting both servers, run the tests:

```bash
# From project root
pnpm test:e2e
```

Or run from e2e directory:
```bash
cd e2e
npx playwright test
```

## Troubleshooting

If tests fail with "Cannot connect to localhost:13100":
1. Make sure the web app is running
2. Check that it's on port 13100
3. Verify the URL is correct

If tests timeout:
1. Increase timeout in playwright.config.ts
2. Add explicit waits in tests
3. Check network connectivity