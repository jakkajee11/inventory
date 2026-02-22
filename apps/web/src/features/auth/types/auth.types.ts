export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  roleId: string;
  companyId: string;
  warehouseId?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  role?: {
    id: string;
    name: string;
    permissions: Permission[];
  };
}

export interface Permission {
  id: string;
  module: string;
  action: string;
  isGranted: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  companyName: string;
  companyTaxId?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
