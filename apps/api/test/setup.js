"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
vitest_1.vi.mock('process.env', () => ({
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/inventory_test?schema=public',
    JWT_SECRET: 'test-secret-key-for-testing-purposes-only',
    REDIS_HOST: 'localhost',
    REDIS_PORT: '6379',
}));
(0, vitest_1.beforeAll)(async () => {
});
(0, vitest_1.afterAll)(async () => {
});
//# sourceMappingURL=setup.js.map