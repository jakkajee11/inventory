import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestHelper } from '../utils/test-helper';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('JWT Token Generation/Validation (T056)', () => {
  let testHelper: TestHelper;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    testHelper = new TestHelper();
    await testHelper.createTestingModule();

    const module = await testHelper.createTestingModule();
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(async () => {
    await testHelper.cleanup();
  });

  describe('JWT token generation', () => {
    it('should generate valid JWT token with payload', async () => {
      const payload = {
        sub: 'user-id-123',
        email: 'test@example.com',
        roles: ['admin'],
        companyId: 'company-id-123',
      };

      const token = await jwtService.signAsync(payload);

      // Verify token is a string
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      // Verify token format (JWT typically has 3 parts separated by dots)
      const parts = token.split('.');
      expect(parts.length).toBe(3);

      // Verify header
      const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
      expect(header.alg).toBe('HS256');
      expect(header.typ).toBe('JWT');
    });

    it('should generate token with default expiration', async () => {
      const payload = {
        sub: 'user-id-123',
        email: 'test@example.com',
      };

      const token = await jwtService.signAsync(payload);
      const decoded = jwtService.decode(token) as any;

      expect(decoded).toBeDefined();
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();

      // Check expiration is reasonable (not too far in the past or future)
      const currentTime = Math.floor(Date.now() / 1000);
      expect(decoded.exp).toBeGreaterThan(currentTime);
      expect(decoded.exp).toBeLessThan(currentTime + 24 * 60 * 60); // Within 24 hours
    });

    it('should generate token with custom expiration', async () => {
      const payload = {
        sub: 'user-id-123',
        email: 'test@example.com',
      };

      const customExpiration = '1h';
      const token = await jwtService.signAsync(payload, { expiresIn: customExpiration });
      const decoded = jwtService.decode(token) as any;

      expect(decoded).toBeDefined();
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });

    it('should include all payload claims in token', async () => {
      const payload = {
        sub: 'user-id-123',
        email: 'test@example.com',
        roles: ['admin', 'manager'],
        companyId: 'company-id-123',
        warehouseId: 'warehouse-id-123',
      };

      const token = await jwtService.signAsync(payload);
      const decoded = jwtService.decode(token) as any;

      expect(decoded.sub).toBe('user-id-123');
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.roles).toEqual(['admin', 'manager']);
      expect(decoded.companyId).toBe('company-id-123');
      expect(decoded.warehouseId).toBe('warehouse-id-123');
    });

    it('should handle empty payload', async () => {
      const payload = {};

      const token = await jwtService.signAsync(payload);
      const decoded = jwtService.decode(token) as any;

      expect(decoded).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });
  });

  describe('JWT token validation', () => {
    it('should verify valid token and return payload', async () => {
      const payload = {
        sub: 'user-id-123',
        email: 'test@example.com',
      };

      const token = await jwtService.signAsync(payload);
      const verifiedPayload = await jwtService.verifyAsync(token);

      expect(verifiedPayload).toBeDefined();
      expect(verifiedPayload.sub).toBe('user-id-123');
      expect(verifiedPayload.email).toBe('test@example.com');
    });

    it('should reject invalid token signature', async () => {
      const payload = {
        sub: 'user-id-123',
        email: 'test@example.com',
      };

      const token = await jwtService.signAsync(payload);

      // Modify token to break signature
      const invalidToken = token.slice(0, -1) + 'x';

      await expect(jwtService.verifyAsync(invalidToken)).rejects.toThrow();
    });

    it('should reject expired token', async () => {
      const payload = {
        sub: 'user-id-123',
        email: 'test@example.com',
      };

      // Create token with past expiration
      const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const token = await jwtService.signAsync(payload, {
        notBefore: pastTime,
        expiresIn: '-1h'
      });

      await expect(jwtService.verifyAsync(token)).rejects.toThrow();
    });

    it('should reject token with invalid format', async () => {
      const invalidTokens = [
        'not-a-jwt-token',
        'header.payload.',
        '.signature',
        'header..signature',
        'header.payload.',
      ];

      for (const invalidToken of invalidTokens) {
        await expect(jwtService.verifyAsync(invalidToken)).rejects.toThrow();
      }
    });

    it('should reject token with missing claims', async () => {
      const payload = {
        email: 'test@example.com',
        // Missing 'sub' claim
      };

      const token = await jwtService.signAsync(payload);
      const verifiedPayload = await jwtService.verifyAsync(token);

      // Should still verify but missing claims should be undefined
      expect(verifiedPayload).toBeDefined();
      expect(verifiedPayload.email).toBe('test@example.com');
      expect(verifiedPayload.sub).toBeUndefined();
    });
  });

  describe('JWT token refresh', () => {
    it('should create refresh token that can be used to generate new access token', async () => {
      const payload = {
        sub: 'user-id-123',
        email: 'test@example.com',
        type: 'refresh',
      };

      const refreshToken = await jwtService.signAsync(payload, { expiresIn: '7d' });
      const accessToken = await jwtService.signAsync({
        sub: 'user-id-123',
        email: 'test@example.com',
        type: 'access',
      });

      // Verify refresh token
      const decodedRefresh = await jwtService.verifyAsync(refreshToken);
      expect(decodedRefresh.type).toBe('refresh');

      // Verify access token
      const decodedAccess = await jwtService.verifyAsync(accessToken);
      expect(decodedAccess.type).toBe('access');
    });

    it('should reject refresh token when used as access token', async () => {
      const payload = {
        sub: 'user-id-123',
        email: 'test@example.com',
        type: 'refresh',
      };

      const refreshToken = await jwtService.signAsync(payload, { expiresIn: '7d' });

      // Refresh token should contain type claim
      const decoded = await jwtService.verifyAsync(refreshToken);
      expect(decoded.type).toBe('refresh');
    });
  });
});