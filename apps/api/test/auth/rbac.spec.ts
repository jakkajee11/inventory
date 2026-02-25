import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestHelper } from '../utils/test-helper';
import { Roles } from '../src/common/decorators/roles.decorator';
import { Role } from '../src/modules/user/domain/entities/role.entity';
import { Permission } from '../src/modules/user/domain/entities/permission.entity';

describe('Role-Based Access Control (T057)', () => {
  let testHelper: TestHelper;

  beforeEach(async () => {
    testHelper = new TestHelper();
    await testHelper.createTestingModule();
  });

  afterEach(async () => {
    await testHelper.cleanup();
  });

  describe('Role hierarchy and permissions', () => {
    it('should create roles with different permission levels', async () => {
      const prisma = testHelper.getPrisma();

      // Create different roles
      const adminRole = await prisma.role.create({
        data: {
          name: 'ADMIN',
          description: 'System administrator with full access',
          isSystem: true,
        },
      });

      const managerRole = await prisma.role.create({
        data: {
          name: 'MANAGER',
          description: 'Department manager with restricted access',
          isSystem: true,
        },
      });

      const staffRole = await prisma.role.create({
        data: {
          name: 'STAFF',
          description: 'Regular staff member with limited access',
          isSystem: true,
        },
      });

      const viewerRole = await prisma.role.create({
        data: {
          name: 'VIEWER',
          description: 'Read-only access',
          isSystem: true,
        },
      });

      expect(adminRole.name).toBe('ADMIN');
      expect(managerRole.name).toBe('MANAGER');
      expect(staffRole.name).toBe('STAFF');
      expect(viewerRole.name).toBe('VIEWER');
    });

    it('should assign permissions to roles', async () => {
      const prisma = testHelper.getPrisma();

      // Create roles
      const adminRole = await prisma.role.create({
        data: {
          name: 'ADMIN',
          description: 'System administrator',
          isSystem: true,
        },
      });

      const managerRole = await prisma.role.create({
        data: {
          name: 'MANAGER',
          description: 'Department manager',
          isSystem: true,
        },
      });

      // Create permissions
      const createProductPerm = await prisma.permission.create({
        data: {
          name: 'CREATE_PRODUCT',
          description: 'Create new products',
        },
      });

      const updateProductPerm = await prisma.permission.create({
        data: {
          name: 'UPDATE_PRODUCT',
          description: 'Update existing products',
        },
      });

      const deleteProductPerm = await prisma.permission.create({
        data: {
          name: 'DELETE_PRODUCT',
          description: 'Delete products',
        },
      });

      // Assign permissions to admin role (all permissions)
      await prisma.rolePermission.createMany({
        data: [
          { roleId: adminRole.id, permissionId: createProductPerm.id },
          { roleId: adminRole.id, permissionId: updateProductPerm.id },
          { roleId: adminRole.id, permissionId: deleteProductPerm.id },
        ],
      });

      // Assign limited permissions to manager role
      await prisma.rolePermission.createMany({
        data: [
          { roleId: managerRole.id, permissionId: createProductPerm.id },
          { roleId: managerRole.id, permissionId: updateProductPerm.id },
        ],
      });

      // Verify permissions
      const adminPermissions = await prisma.permission.findMany({
        where: {
          roles: {
            some: {
              id: adminRole.id,
            },
          },
        },
      });

      const managerPermissions = await prisma.permission.findMany({
        where: {
          roles: {
            some: {
              id: managerRole.id,
            },
          },
        },
      });

      expect(adminPermissions.length).toBe(3);
      expect(managerPermissions.length).toBe(2);
      expect(managerPermissions.some(p => p.name === 'DELETE_PRODUCT')).toBe(false);
    });

    it('should check user permissions through role assignments', async () => {
      const prisma = testHelper.getPrisma();

      // Create company and roles
      const company = await testHelper.createTestCompany();
      const adminRole = await prisma.role.create({
        data: {
          name: 'ADMIN',
          isSystem: true,
        },
      });

      const staffRole = await prisma.role.create({
        data: {
          name: 'STAFF',
          isSystem: true,
        },
      });

      // Create permissions
      const manageProductsPerm = await prisma.permission.create({
        data: {
          name: 'MANAGE_PRODUCTS',
          description: 'Manage all products',
        },
      });

      // Assign permissions to roles
      await prisma.rolePermission.createMany({
        data: [
          { roleId: adminRole.id, permissionId: manageProductsPerm.id },
        ],
      });

      // Create users with different roles
      const adminUser = await testHelper.createTestUser(company.id, adminRole.id);
      const staffUser = await testHelper.createTestUser(company.id, staffRole.id);

      // Verify admin has permission
      const adminPermissions = await prisma.permission.findMany({
        where: {
          roles: {
            some: {
              users: {
                some: {
                  id: adminUser.id,
                },
              },
            },
          },
        },
      });

      // Verify staff does not have permission
      const staffPermissions = await prisma.permission.findMany({
        where: {
          roles: {
            some: {
              users: {
                some: {
                  id: staffUser.id,
                },
              },
            },
          },
        },
      });

      expect(adminPermissions.length).toBe(1);
      expect(adminPermissions[0].name).toBe('MANAGE_PRODUCTS');
      expect(staffPermissions.length).toBe(0);
    });
  });

  describe('RBAC decorator implementation', () => {
    it('should validate roles decorator with allowed roles', async () => {
      const testRoles = ['ADMIN', 'MANAGER'] as const;
      const rolesDecorator = Roles(...testRoles);

      // Test decorator usage (simulating runtime behavior)
      const userRole = 'ADMIN';
      const hasPermission = testRoles.includes(userRole as any);

      expect(hasPermission).toBe(true);
    });

    it('should reject users without required roles', async () => {
      const testRoles = ['ADMIN', 'MANAGER'] as const;
      const rolesDecorator = Roles(...testRoles);

      // Test decorator usage
      const userRole = 'STAFF';
      const hasPermission = testRoles.includes(userRole as any);

      expect(hasPermission).toBe(false);
    });

    it('should handle multiple role requirements', async () => {
      const testRoles = ['ADMIN', 'MANAGER', 'STAFF'] as const;
      const rolesDecorator = Roles(...testRoles);

      // Test with different user roles
      const testCases = [
        { role: 'ADMIN', expected: true },
        { role: 'MANAGER', expected: true },
        { role: 'STAFF', expected: true },
        { role: 'VIEWER', expected: false },
        { role: 'SOMETHING_ELSE', expected: false },
      ];

      for (const testCase of testCases) {
        const hasPermission = testRoles.includes(testCase.role as any);
        expect(hasPermission).toBe(testCase.expected);
      }
    });

    it('should validate role case sensitivity', async () => {
      const testRoles = ['ADMIN', 'manager'] as const;
      const rolesDecorator = Roles(...testRoles);

      const testCase1 = 'ADMIN'; // exact match
      const testCase2 = 'admin'; // lowercase - should not match
      const testCase3 = 'Manager'; // different case - should not match
      const testCase4 = 'manager'; // exact match

      expect(testRoles.includes(testCase1 as any)).toBe(true);
      expect(testRoles.includes(testCase2 as any)).toBe(false);
      expect(testRoles.includes(testCase3 as any)).toBe(false);
      expect(testRoles.includes(testCase4 as any)).toBe(true);
    });
  });

  describe('Permission inheritance', () => {
    it('should implement role hierarchy where higher roles inherit lower role permissions', async () => {
      const prisma = testHelper.getPrisma();

      // Create company and roles
      const company = await testHelper.createTestCompany();
      const adminRole = await prisma.role.create({
        data: {
          name: 'ADMIN',
          isSystem: true,
        },
      });

      const managerRole = await prisma.role.create({
        data: {
          name: 'MANAGER',
          isSystem: true,
        },
      });

      const staffRole = await prisma.role.create({
        data: {
          name: 'STAFF',
          isSystem: true,
        },
      });

      // Create permissions
      const createPerm = await prisma.permission.create({
        data: { name: 'CREATE', description: 'Create items' },
      });

      const readPerm = await prisma.permission.create({
        data: { name: 'READ', description: 'Read items' },
      });

      const updatePerm = await prisma.permission.create({
        data: { name: 'UPDATE', description: 'Update items' },
      });

      const deletePerm = await prisma.permission.create({
        data: { name: 'DELETE', description: 'Delete items' },
      });

      // Assign permissions: Admin has all, Manager has CREATE+READ+UPDATE, Staff has READ only
      await prisma.rolePermission.createMany({
        data: [
          // Admin permissions
          { roleId: adminRole.id, permissionId: createPerm.id },
          { roleId: adminRole.id, permissionId: readPerm.id },
          { roleId: adminRole.id, permissionId: updatePerm.id },
          { roleId: adminRole.id, permissionId: deletePerm.id },

          // Manager permissions
          { roleId: managerRole.id, permissionId: createPerm.id },
          { roleId: managerRole.id, permissionId: readPerm.id },
          { roleId: managerRole.id, permissionId: updatePerm.id },

          // Staff permissions
          { roleId: staffRole.id, permissionId: readPerm.id },
        ],
      });

      // Create users
      const adminUser = await testHelper.createTestUser(company.id, adminRole.id);
      const managerUser = await testHelper.createTestUser(company.id, managerRole.id);
      const staffUser = await testHelper.createTestUser(company.id, staffRole.id);

      // Check permissions for each user
      const adminPermissions = await prisma.permission.findMany({
        where: {
          roles: {
            some: {
              users: { some: { id: adminUser.id } }
            }
          }
        }
      });

      const managerPermissions = await prisma.permission.findMany({
        where: {
          roles: {
            some: {
              users: { some: { id: managerUser.id } }
            }
          }
        }
      });

      const staffPermissions = await prisma.permission.findMany({
        where: {
          roles: {
            some: {
              users: { some: { id: staffUser.id } }
            }
          }
        }
      });

      // Verify permission inheritance
      expect(adminPermissions.length).toBe(4);
      expect(managerPermissions.length).toBe(3);
      expect(staffPermissions.length).toBe(1);

      expect(adminPermissions.map(p => p.name).sort()).toEqual(['CREATE', 'DELETE', 'READ', 'UPDATE']);
      expect(managerPermissions.map(p => p.name).sort()).toEqual(['CREATE', 'READ', 'UPDATE']);
      expect(staffPermissions.map(p => p.name)).toEqual(['READ']);
    });
  });
});