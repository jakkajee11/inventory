import { PrismaService } from '../src/prisma/prisma.service';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';

export class TestHelper {
  private prisma: PrismaService;
  private app: INestApplication;

  async createTestingModule() {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = moduleRef.createNestApplication();
    await this.app.init();
    this.prisma = moduleRef.get(PrismaService);
  }

  getPrisma() {
    return this.prisma;
  }

  getApp() {
    return this.app;
  }

  async cleanup() {
    await this.app.close();
  }

  async createTestCompany() {
    return this.prisma.company.create({
      data: {
        name: 'Test Company',
        taxId: 'TEST123',
        currency: 'THB',
        timezone: 'Asia/Bangkok',
      },
    });
  }

  async createTestUser(companyId: string, roleId: string) {
    return this.prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash: '$2b$10$testHash',
        name: 'Test User',
        companyId,
        roleId,
        isActive: true,
      },
    });
  }

  async createTestRole() {
    return this.prisma.role.create({
      data: {
        name: 'TEST_ROLE',
        description: 'Test Role',
        isSystem: false,
      },
    });
  }

  async createTestWarehouse(companyId: string) {
    return this.prisma.warehouse.create({
      data: {
        name: 'Test Warehouse',
        code: 'WH001',
        companyId,
        isActive: true,
      },
    });
  }

  async createTestCategory(companyId: string, parentId?: string) {
    return this.prisma.category.create({
      data: {
        name: 'Test Category',
        code: 'CAT001',
        companyId,
        parentId,
        isActive: true,
      },
    });
  }

  async createTestUnit(companyId: string) {
    return this.prisma.unit.create({
      data: {
        name: 'Test Unit',
        code: 'UNIT001',
        companyId,
        isActive: true,
      },
    });
  }

  async createTestProduct(companyId: string, categoryId: string, unitId: string) {
    return this.prisma.product.create({
      data: {
        name: 'Test Product',
        sku: 'TEST001',
        barcode: '123456789012',
        companyId,
        categoryId,
        unitId,
        purchasePrice: 100,
        sellingPrice: 150,
        isActive: true,
      },
    });
  }

  async createTestStock(productId: string, warehouseId: string, quantity: number) {
    return this.prisma.stock.create({
      data: {
        productId,
        warehouseId,
        quantity,
      },
    });
  }
}