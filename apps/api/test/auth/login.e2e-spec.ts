import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';

describe('Login Flow E2E (T058)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    prisma = moduleRef.get<PrismaService>(PrismaService);
    jwtService = moduleRef.get<JwtService>(JwtService);

    // Setup test data
    await setupTestData(prisma);
  });

  afterAll(async () => {
    await cleanupTestData(prisma);
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('should successfully login with valid credentials', async () => {
      const loginData = {
        email: 'admin@example.com',
        password: 'admin123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user.email).toBe('admin@example.com');
    });

    it('should reject login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'admin123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should reject login with invalid password', async () => {
      const loginData = {
        email: 'admin@example.com',
        password: 'wrongpassword',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should reject login with empty email', async () => {
      const loginData = {
        email: '',
        password: 'admin123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject login with empty password', async () => {
      const loginData = {
        email: 'admin@example.com',
        password: '',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject login with missing email field', async () => {
      const loginData = {
        password: 'admin123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject login with missing password field', async () => {
      const loginData = {
        email: 'admin@example.com',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject login with inactive user account', async () => {
      // Create inactive user
      const company = await prisma.company.create({
        data: {
          name: 'Test Company',
          taxId: 'TEST123',
        },
      });

      const role = await prisma.role.create({
        data: {
          name: 'STAFF',
          isSystem: true,
        },
      });

      const inactiveUser = await prisma.user.create({
        data: {
          email: 'inactive@example.com',
          passwordHash: await bcrypt.hash('password123', 10),
          name: 'Inactive User',
          companyId: company.id,
          roleId: role.id,
          isActive: false, // Inactive account
        },
      });

      const loginData = {
        email: 'inactive@example.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Account inactive');
    });

    it('should validate email format', async () => {
      const invalidEmails = [
        'invalid-email',
        'user@.com',
        '@domain.com',
        'user@domain',
        'user.domain.com',
        '',
      ];

      for (const email of invalidEmails) {
        const loginData = {
          email,
          password: 'password123',
        };

        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send(loginData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      }
    });

    it('should return user details including role and permissions', async () => {
      const loginData = {
        email: 'admin@example.com',
        password: 'admin123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(201);

      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user).toHaveProperty('name');
      expect(response.body.user).toHaveProperty('roleId');
      expect(response.body.user).toHaveProperty('companyId');
      expect(response.body.user).toHaveProperty('isActive');
      expect(response.body.user).toHaveProperty('createdAt');
      expect(response.body.user).toHaveProperty('updatedAt');
    });

    it('should generate valid JWT tokens', async () => {
      const loginData = {
        email: 'admin@example.com',
        password: 'admin123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(201);

      // Verify access token
      const decodedAccessToken = jwtService.decode(response.body.accessToken) as any;
      expect(decodedAccessToken).toHaveProperty('sub');
      expect(decodedAccessToken).toHaveProperty('email');
      expect(decodedAccessToken).toHaveProperty('roles');
      expect(decodedAccessToken).toHaveProperty('companyId');

      // Verify refresh token
      const decodedRefreshToken = jwtService.decode(response.body.refreshToken) as any;
      expect(decodedRefreshToken).toHaveProperty('sub');
      expect(decodedRefreshToken).toHaveProperty('email');
      expect(decodedRefreshToken).toHaveProperty('type');
      expect(decodedRefreshToken.type).toBe('refresh');
    });

    it('should limit login attempts to prevent brute force', async () => {
      const loginData = {
        email: 'admin@example.com',
        password: 'wrongpassword',
      };

      // Make multiple failed attempts
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/auth/login')
          .send(loginData)
          .expect(401);
      }

      // After 5 failed attempts, next attempt should be rate limited
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(429);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      // First login to get refresh token
      const loginData = {
        email: 'admin@example.com',
        password: 'admin123',
      };

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(201);

      // Refresh token
      const refreshData = {
        refreshToken: loginResponse.body.refreshToken,
      };

      const refreshResponse = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send(refreshData)
        .expect(201);

      expect(refreshResponse.body).toHaveProperty('accessToken');
      expect(refreshResponse.body).toHaveProperty('refreshToken');
    });

    it('should reject refresh token with invalid signature', async () => {
      const refreshData = {
        refreshToken: 'invalid.token.signature',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send(refreshData)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject refresh token without token field', async () => {
      const refreshData = {};

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send(refreshData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject refresh token with empty token', async () => {
      const refreshData = {
        refreshToken: '',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send(refreshData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout user successfully', async () => {
      // First login
      const loginData = {
        email: 'admin@example.com',
        password: 'admin123',
      };

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(201);

      // Logout
      const logoutData = {
        refreshToken: loginResponse.body.refreshToken,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .send(logoutData)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Logged out successfully');
    });

    it('should handle logout with invalid refresh token', async () => {
      const logoutData = {
        refreshToken: 'invalid.token',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .send(logoutData)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });
});

// Helper functions
async function setupTestData(prisma: PrismaService) {
  // Create company
  const company = await prisma.company.create({
    data: {
      name: 'Test Company',
      taxId: 'TEST123',
      currency: 'THB',
      timezone: 'Asia/Bangkok',
    },
  });

  // Create admin role
  const adminRole = await prisma.role.create({
    data: {
      name: 'ADMIN',
      description: 'System administrator',
      isSystem: true,
    },
  });

  // Create admin user
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      name: 'Admin User',
      companyId: company.id,
      roleId: adminRole.id,
      isActive: true,
    },
  });

  // Create staff user
  const staffRole = await prisma.role.create({
    data: {
      name: 'STAFF',
      description: 'Regular staff',
      isSystem: true,
    },
  });

  await prisma.user.create({
    data: {
      email: 'staff@example.com',
      passwordHash: await bcrypt.hash('staff123', 10),
      name: 'Staff User',
      companyId: company.id,
      roleId: staffRole.id,
      isActive: true,
    },
  });
}

async function cleanupTestData(prisma: PrismaService) {
  // Clean up test data
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['admin@example.com', 'staff@example.com'],
      },
    },
  });

  await prisma.role.deleteMany({
    where: {
      name: {
        in: ['ADMIN', 'STAFF'],
      },
    },
  });

  await prisma.company.deleteMany({
    where: {
      name: 'Test Company',
    },
  });
}