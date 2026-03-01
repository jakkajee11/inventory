export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  parent?: Category;
  children?: Category[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryQuery {
  page?: number;
  limit?: number;
  search?: string;
  includeInactive?: boolean;
}

export interface CategoryListResponse {
  categories: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {}
