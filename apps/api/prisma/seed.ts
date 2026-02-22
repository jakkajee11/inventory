import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Role definitions with their permissions
const roleDefinitions = [
  {
    name: 'Admin',
    description: 'Full system administrator with all permissions',
    isSystem: true,
    permissions: [
      // Products
      { module: 'products', action: 'CREATE' },
      { module: 'products', action: 'READ' },
      { module: 'products', action: 'UPDATE' },
      { module: 'products', action: 'DELETE' },
      // Categories
      { module: 'categories', action: 'CREATE' },
      { module: 'categories', action: 'READ' },
      { module: 'categories', action: 'UPDATE' },
      { module: 'categories', action: 'DELETE' },
      // Units
      { module: 'units', action: 'CREATE' },
      { module: 'units', action: 'READ' },
      { module: 'units', action: 'UPDATE' },
      { module: 'units', action: 'DELETE' },
      // Inventory
      { module: 'inventory', action: 'READ' },
      { module: 'inventory', action: 'EXPORT' },
      // Goods Receipt
      { module: 'goods_receipt', action: 'CREATE' },
      { module: 'goods_receipt', action: 'READ' },
      { module: 'goods_receipt', action: 'UPDATE' },
      { module: 'goods_receipt', action: 'DELETE' },
      { module: 'goods_receipt', action: 'APPROVE' },
      // Goods Issue
      { module: 'goods_issue', action: 'CREATE' },
      { module: 'goods_issue', action: 'READ' },
      { module: 'goods_issue', action: 'UPDATE' },
      { module: 'goods_issue', action: 'DELETE' },
      { module: 'goods_issue', action: 'APPROVE' },
      // Stock Adjustment
      { module: 'stock_adjustment', action: 'CREATE' },
      { module: 'stock_adjustment', action: 'READ' },
      { module: 'stock_adjustment', action: 'UPDATE' },
      { module: 'stock_adjustment', action: 'DELETE' },
      { module: 'stock_adjustment', action: 'APPROVE' },
      // Users
      { module: 'users', action: 'CREATE' },
      { module: 'users', action: 'READ' },
      { module: 'users', action: 'UPDATE' },
      { module: 'users', action: 'DELETE' },
      // Roles
      { module: 'roles', action: 'READ' },
      // Warehouses
      { module: 'warehouses', action: 'CREATE' },
      { module: 'warehouses', action: 'READ' },
      { module: 'warehouses', action: 'UPDATE' },
      { module: 'warehouses', action: 'DELETE' },
      // Reports
      { module: 'reports', action: 'READ' },
      { module: 'reports', action: 'EXPORT' },
      // Settings
      { module: 'settings', action: 'READ' },
      { module: 'settings', action: 'UPDATE' },
      // Audit Logs
      { module: 'audit_logs', action: 'READ' },
      // Notifications
      { module: 'notifications', action: 'READ' },
      { module: 'notifications', action: 'UPDATE' },
    ],
  },
  {
    name: 'Manager',
    description: 'Warehouse manager with approval permissions',
    isSystem: true,
    permissions: [
      // Products
      { module: 'products', action: 'CREATE' },
      { module: 'products', action: 'READ' },
      { module: 'products', action: 'UPDATE' },
      { module: 'products', action: 'DELETE' },
      // Categories
      { module: 'categories', action: 'CREATE' },
      { module: 'categories', action: 'READ' },
      { module: 'categories', action: 'UPDATE' },
      { module: 'categories', action: 'DELETE' },
      // Units
      { module: 'units', action: 'CREATE' },
      { module: 'units', action: 'READ' },
      { module: 'units', action: 'UPDATE' },
      { module: 'units', action: 'DELETE' },
      // Inventory
      { module: 'inventory', action: 'READ' },
      { module: 'inventory', action: 'EXPORT' },
      // Goods Receipt
      { module: 'goods_receipt', action: 'CREATE' },
      { module: 'goods_receipt', action: 'READ' },
      { module: 'goods_receipt', action: 'UPDATE' },
      { module: 'goods_receipt', action: 'DELETE' },
      { module: 'goods_receipt', action: 'APPROVE' },
      // Goods Issue
      { module: 'goods_issue', action: 'CREATE' },
      { module: 'goods_issue', action: 'READ' },
      { module: 'goods_issue', action: 'UPDATE' },
      { module: 'goods_issue', action: 'DELETE' },
      { module: 'goods_issue', action: 'APPROVE' },
      // Stock Adjustment
      { module: 'stock_adjustment', action: 'CREATE' },
      { module: 'stock_adjustment', action: 'READ' },
      { module: 'stock_adjustment', action: 'UPDATE' },
      { module: 'stock_adjustment', action: 'DELETE' },
      { module: 'stock_adjustment', action: 'APPROVE' },
      // Users
      { module: 'users', action: 'READ' },
      { module: 'users', action: 'UPDATE' },
      // Roles
      { module: 'roles', action: 'READ' },
      // Warehouses
      { module: 'warehouses', action: 'READ' },
      { module: 'warehouses', action: 'UPDATE' },
      // Reports
      { module: 'reports', action: 'READ' },
      { module: 'reports', action: 'EXPORT' },
      // Settings
      { module: 'settings', action: 'READ' },
      // Notifications
      { module: 'notifications', action: 'READ' },
      { module: 'notifications', action: 'UPDATE' },
    ],
  },
  {
    name: 'Staff',
    description: 'Warehouse staff with create and edit permissions',
    isSystem: true,
    permissions: [
      // Products
      { module: 'products', action: 'READ' },
      { module: 'products', action: 'CREATE' },
      { module: 'products', action: 'UPDATE' },
      // Categories
      { module: 'categories', action: 'READ' },
      // Units
      { module: 'units', action: 'READ' },
      // Inventory
      { module: 'inventory', action: 'READ' },
      // Goods Receipt
      { module: 'goods_receipt', action: 'CREATE' },
      { module: 'goods_receipt', action: 'READ' },
      { module: 'goods_receipt', action: 'UPDATE' },
      // Goods Issue
      { module: 'goods_issue', action: 'CREATE' },
      { module: 'goods_issue', action: 'READ' },
      { module: 'goods_issue', action: 'UPDATE' },
      // Stock Adjustment
      { module: 'stock_adjustment', action: 'CREATE' },
      { module: 'stock_adjustment', action: 'READ' },
      { module: 'stock_adjustment', action: 'UPDATE' },
      // Warehouses
      { module: 'warehouses', action: 'READ' },
      // Reports
      { module: 'reports', action: 'READ' },
      // Notifications
      { module: 'notifications', action: 'READ' },
      { module: 'notifications', action: 'UPDATE' },
    ],
  },
  {
    name: 'Viewer',
    description: 'Read-only access to view inventory and reports',
    isSystem: true,
    permissions: [
      // Products
      { module: 'products', action: 'READ' },
      // Categories
      { module: 'categories', action: 'READ' },
      // Units
      { module: 'units', action: 'READ' },
      // Inventory
      { module: 'inventory', action: 'READ' },
      // Goods Receipt
      { module: 'goods_receipt', action: 'READ' },
      // Goods Issue
      { module: 'goods_issue', action: 'READ' },
      // Stock Adjustment
      { module: 'stock_adjustment', action: 'READ' },
      // Warehouses
      { module: 'warehouses', action: 'READ' },
      // Reports
      { module: 'reports', action: 'READ' },
      // Notifications
      { module: 'notifications', action: 'READ' },
    ],
  },
];

async function main() {
  console.log('Starting seed...');

  // Create roles and permissions
  for (const roleDef of roleDefinitions) {
    console.log(`Creating role: ${roleDef.name}`);

    // Find existing role by name or create new one
    let role = await prisma.role.findFirst({
      where: { name: roleDef.name },
    });

    if (!role) {
      role = await prisma.role.create({
        data: {
          name: roleDef.name,
          description: roleDef.description,
          isSystem: roleDef.isSystem,
        },
      });
    } else {
      role = await prisma.role.update({
        where: { id: role.id },
        data: {
          description: roleDef.description,
          isSystem: roleDef.isSystem,
        },
      });
    }

    // Create permissions for the role
    for (const permDef of roleDef.permissions) {
      await prisma.permission.upsert({
        where: {
          roleId_module_action: {
            roleId: role.id,
            module: permDef.module,
            action: permDef.action,
          },
        },
        update: {
          isGranted: true,
        },
        create: {
          roleId: role.id,
          module: permDef.module,
          action: permDef.action,
          isGranted: true,
        },
      });
    }

    console.log(`Created ${roleDef.permissions.length} permissions for role: ${roleDef.name}`);
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
