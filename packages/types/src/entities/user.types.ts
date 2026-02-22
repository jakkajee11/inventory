/**
 * User, Role, and Permission type definitions
 */

/**
 * Permission definition
 */
export interface Permission {
  id: string;
  code: string;
  name: string;
  nameTh: string;
  description?: string;
  module: string;
  action: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Role definition
 */
export interface Role {
  id: string;
  code: string;
  name: string;
  nameTh: string;
  description?: string;
  companyId: string;
  isSystem: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Role with permissions
 */
export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

/**
 * User entity
 */
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  firstNameTh?: string;
  lastNameTh?: string;
  phone?: string;
  avatarUrl?: string;
  companyId: string;
  
  // Status
  isActive: boolean;
  isVerified: boolean;
  isLocked: boolean;
  lockedUntil?: Date;
  
  // Authentication
  lastLoginAt?: Date;
  loginAttempts: number;
  passwordChangedAt?: Date;
  mustChangePassword: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User with roles
 */
export interface UserWithRoles extends User {
  roles: Role[];
}

/**
 * User with full details including roles and permissions
 */
export interface UserWithDetails extends UserWithRoles {
  permissions: Permission[];
  company: import('./company.types').Company;
}

/**
 * User creation DTO
 */
export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  firstNameTh?: string;
  lastNameTh?: string;
  phone?: string;
  companyId: string;
  roleIds: string[];
}

/**
 * User update DTO
 */
export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  firstNameTh?: string;
  lastNameTh?: string;
  phone?: string;
  avatarUrl?: string;
  isActive?: boolean;
}

/**
 * User login DTO
 */
export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * User login response
 */
export interface LoginResponse {
  user: UserWithDetails;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Password change DTO
 */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Password reset request DTO
 */
export interface RequestPasswordResetDto {
  email: string;
}

/**
 * Password reset DTO
 */
export interface ResetPasswordDto {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * User filter options
 */
export interface UserFilterOptions {
  search?: string;
  companyId?: string;
  roleId?: string;
  isActive?: boolean;
  isVerified?: boolean;
}

/**
 * Permission code constants
 */
export const PERMISSION_CODES = {
  // Product permissions
  PRODUCT_VIEW: 'product:view',
  PRODUCT_CREATE: 'product:create',
  PRODUCT_UPDATE: 'product:update',
  PRODUCT_DELETE: 'product:delete',
  
  // Inventory permissions
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_ADJUST: 'inventory:adjust',
  INVENTORY_RECEIVE: 'inventory:receive',
  INVENTORY_ISSUE: 'inventory:issue',
  
  // User permissions
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  
  // Role permissions
  ROLE_VIEW: 'role:view',
  ROLE_CREATE: 'role:create',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',
  
  // Report permissions
  REPORT_VIEW: 'report:view',
  REPORT_EXPORT: 'report:export',
  
  // Settings permissions
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_UPDATE: 'settings:update',
} as const;

export type PermissionCode = typeof PERMISSION_CODES[keyof typeof PERMISSION_CODES];
