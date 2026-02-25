import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestHelper } from '../utils/test-helper';
import * as bcrypt from 'bcrypt';

describe('Password Hashing (T055)', () => {
  let testHelper: TestHelper;

  beforeEach(async () => {
    testHelper = new TestHelper();
    await testHelper.createTestingModule();
  });

  afterEach(async () => {
    await testHelper.cleanup();
  });

  describe('bcrypt password hashing', () => {
    it('should hash password using bcrypt with salt rounds 10', async () => {
      const plainPassword = 'testPassword123';
      const saltRounds = 10;

      const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

      // Verify password is hashed
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword.startsWith('$2b$10$')).toBe(true);

      // Verify password matches original
      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      expect(isMatch).toBe(true);
    });

    it('should generate different hashes for same password', async () => {
      const plainPassword = 'testPassword123';

      const hash1 = await bcrypt.hash(plainPassword, 10);
      const hash2 = await bcrypt.hash(plainPassword, 10);

      // Hashes should be different
      expect(hash1).not.toBe(hash2);

      // Both should still match the original password
      expect(await bcrypt.compare(plainPassword, hash1)).toBe(true);
      expect(await bcrypt.compare(plainPassword, hash2)).toBe(true);
    });

    it('should reject password if hash comparison fails', async () => {
      const plainPassword = 'testPassword123';
      const wrongPassword = 'wrongPassword123';

      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const isMatch = await bcrypt.compare(wrongPassword, hashedPassword);
      expect(isMatch).toBe(false);
    });

    it('should handle empty password', async () => {
      const emptyPassword = '';

      const hashedPassword = await bcrypt.hash(emptyPassword, 10);
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(emptyPassword);

      const isMatch = await bcrypt.compare(emptyPassword, hashedPassword);
      expect(isMatch).toBe(true);
    });

    it('should handle long passwords', async () => {
      const longPassword = 'a'.repeat(1000);

      const hashedPassword = await bcrypt.hash(longPassword, 10);
      expect(hashedPassword).toBeDefined();

      const isMatch = await bcrypt.compare(longPassword, hashedPassword);
      expect(isMatch).toBe(true);
    });

    it('should be consistent with multiple verifications', async () => {
      const plainPassword = 'testPassword123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      // Verify multiple times
      for (let i = 0; i < 5; i++) {
        const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
        expect(isMatch).toBe(true);
      }
    });

    it('should work with different salt rounds', async () => {
      const plainPassword = 'testPassword123';

      const hash5 = await bcrypt.hash(plainPassword, 5);
      const hash10 = await bcrypt.hash(plainPassword, 10);
      const hash12 = await bcrypt.hash(plainPassword, 12);

      expect(hash5.startsWith('$2b$05$')).toBe(true);
      expect(hash10.startsWith('$2b$10$')).toBe(true);
      expect(hash12.startsWith('$2b$12$')).toBe(true);

      // All should match original password
      expect(await bcrypt.compare(plainPassword, hash5)).toBe(true);
      expect(await bcrypt.compare(plainPassword, hash10)).toBe(true);
      expect(await bcrypt.compare(plainPassword, hash12)).toBe(true);
    });
  });
});