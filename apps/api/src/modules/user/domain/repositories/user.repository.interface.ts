import { User } from '../entities/user.entity';

export interface UserRepositoryInterface {
  /**
   * Find a user by ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find a user by email within a company
   */
  findByEmail(email: string, companyId: string): Promise<User | null>;

  /**
   * Find a user by email with role and permissions
   */
  findByEmailWithRole(email: string, companyId: string): Promise<User | null>;

  /**
   * Create a new user
   */
  create(data: {
    email: string;
    passwordHash: string;
    name: string;
    roleId: string;
    companyId: string;
    phone?: string;
    warehouseId?: string;
  }): Promise<User>;

  /**
   * Update a user
   */
  update(id: string, data: Partial<User>): Promise<User>;

  /**
   * Soft delete a user
   */
  softDelete(id: string): Promise<void>;

  /**
   * Update last login timestamp
   */
  updateLastLogin(id: string): Promise<void>;

  /**
   * Find all users by company ID
   */
  findAllByCompanyId(companyId: string, options?: {
    skip?: number;
    take?: number;
    includeInactive?: boolean;
  }): Promise<{ users: User[]; total: number }>;

  /**
   * Check if email exists in company
   */
  emailExists(email: string, companyId: string, excludeId?: string): Promise<boolean>;

  /**
   * Find user with role and permissions by ID
   */
  findByIdWithPermissions(id: string): Promise<User | null>;
}
