// Re-export all decorators from a single entry point

// User decorators
export { CurrentUser, CurrentUserType } from './current-user.decorator';

// Role decorators
export { Roles, AdminOnly, ManagerAndAbove, StaffAndAbove, ViewerAndAbove } from './roles.decorator';
export { ROLES_KEY } from './roles.decorator';

// Tenant decorators
export { TenantId, RequireTenant } from './tenant-id.decorator';

// Public route decorator
export { Public, IS_PUBLIC_KEY } from './public.decorator';

// Permission decorators
export {
  RequirePermissions,
  PermissionAction,
  PermissionModule,
  PERMISSIONS_KEY,
} from '../guards/roles.guard';
export type { PermissionRequirement } from '../guards/roles.guard';

// Audit log decorator
export {
  AuditLog,
  AuditAction,
  AUDIT_CONFIG_KEY,
} from '../interceptors/audit-log.interceptor';
export type { AuditConfig } from '../interceptors/audit-log.interceptor';
