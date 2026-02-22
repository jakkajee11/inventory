import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../guards/roles.guard';

/**
 * Metadata key for storing roles
 */
export const ROLES_KEY = 'roles';

/**
 * @Roles() decorator
 * Specifies required roles for accessing a route or controller
 *
 * Usage examples:
 * - @Roles(UserRole.ADMIN) - Only admins can access
 * - @Roles(UserRole.ADMIN, UserRole.MANAGER) - Admins and managers can access
 * - @Roles(UserRole.STAFF) - Staff and above can access (due to role hierarchy)
 *
 * Note: RolesGuard uses a hierarchy where ADMIN > MANAGER > STAFF > VIEWER
 * So specifying @Roles(UserRole.STAFF) will allow STAFF, MANAGER, and ADMIN
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Shortcut decorators for common role requirements
 */
export const AdminOnly = () => Roles(UserRole.ADMIN);

export const ManagerAndAbove = () => Roles(UserRole.MANAGER);

export const StaffAndAbove = () => Roles(UserRole.STAFF);

export const ViewerAndAbove = () => Roles(UserRole.VIEWER);
