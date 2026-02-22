import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * User role enumeration
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
  VIEWER = 'VIEWER',
}

/**
 * Role hierarchy for permission checks
 * Higher index = higher permissions
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.VIEWER]: 0,
  [UserRole.STAFF]: 1,
  [UserRole.MANAGER]: 2,
  [UserRole.ADMIN]: 3,
};

/**
 * Request user interface
 */
export interface RequestUser {
  id: string;
  email: string;
  role: UserRole;
  companyId: string;
  warehouseId?: string;
}

/**
 * RBAC Guard
 * Checks if user has required roles to access a resource
 * Supports role hierarchy where higher roles inherit lower role permissions
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from decorator
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: RequestUser = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user's role is in the required roles
    const hasRole = requiredRoles.some((role) => this.hasRequiredRole(user.role, role));

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}. Your role: ${user.role}`,
      );
    }

    return true;
  }

  /**
   * Check if user's role meets or exceeds the required role
   * Uses role hierarchy where ADMIN > MANAGER > STAFF > VIEWER
   */
  private hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
    const userRoleLevel = ROLE_HIERARCHY[userRole] ?? -1;
    const requiredRoleLevel = ROLE_HIERARCHY[requiredRole] ?? 0;
    return userRoleLevel >= requiredRoleLevel;
  }
}

/**
 * Permission action types
 */
export enum PermissionAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
}

/**
 * Permission module types
 */
export enum PermissionModule {
  PRODUCT = 'PRODUCT',
  INVENTORY = 'INVENTORY',
  GOODS_RECEIPT = 'GOODS_RECEIPT',
  GOODS_ISSUE = 'GOODS_ISSUE',
  STOCK_ADJUSTMENT = 'STOCK_ADJUSTMENT',
  USER = 'USER',
  REPORT = 'REPORT',
  NOTIFICATION = 'NOTIFICATION',
  SETTINGS = 'SETTINGS',
}

/**
 * Permission requirement interface
 */
export interface PermissionRequirement {
  module: PermissionModule;
  action: PermissionAction;
}

/**
 * Permission guard key
 */
export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to specify required permissions for a route
 */
export const RequirePermissions = (...permissions: PermissionRequirement[]) => {
  return (target: unknown, key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(PERMISSIONS_KEY, permissions, descriptor.value);
    return descriptor;
  };
};
