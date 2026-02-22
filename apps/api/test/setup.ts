import { beforeAll, afterAll, vi } from 'vitest';

// Mock environment variables for testing
vi.mock('process.env', () => ({
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/inventory_test?schema=public',
  JWT_SECRET: 'test-secret-key-for-testing-purposes-only',
  REDIS_HOST: 'localhost',
  REDIS_PORT: '6379',
}));

beforeAll(async () => {
  // Setup test database or any global test resources
});

afterAll(async () => {
  // Cleanup test resources
});
