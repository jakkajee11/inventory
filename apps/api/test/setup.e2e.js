"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
(0, vitest_1.beforeAll)(async () => {
    try {
        await execAsync('npx prisma migrate deploy');
    }
    catch (error) {
        console.error('Failed to setup test database:', error);
    }
});
(0, vitest_1.afterAll)(async () => {
});
//# sourceMappingURL=setup.e2e.js.map