-- Create default tenant
INSERT INTO "Tenant" (id, name, domain, isActive, createdBy, createdAt, updatedBy, updatedAt)
VALUES ('default-tenant', 'Default Company', 'default', true, 'system', NOW(), 'system', NOW())
ON CONFLICT (id) DO NOTHING;

-- Create default admin user
INSERT INTO "User" (id, email, password, firstName, lastName, role, companyId, isActive, createdBy, createdAt, updatedBy, updatedAt)
VALUES (
  'admin-user',
  'admin@inventory.com',
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',  // password: admin123
  'System',
  'Admin',
  'SUPER_ADMIN',
  'default-tenant',
  true,
  'system',
  NOW(),
  'system',
  NOW()
) ON CONFLICT (email) DO NOTHING;