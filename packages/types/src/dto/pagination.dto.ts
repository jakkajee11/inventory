/**
 * Pagination DTO definitions
 */

/**
 * Pagination query parameters
 */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Offset-based pagination parameters
 */
export interface OffsetPaginationQuery {
  offset?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Cursor-based pagination parameters (for infinite scroll)
 */
export interface CursorPaginationQuery {
  cursor?: string;
  limit?: number;
  direction?: 'forward' | 'backward';
}

/**
 * Cursor-based paginated response
 */
export interface CursorPaginatedResponse<T> {
  data: T[];
  pagination: CursorPaginationMeta;
}

/**
 * Cursor pagination metadata
 */
export interface CursorPaginationMeta {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
  totalCount?: number;
}

/**
 * Default pagination values
 */
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
} as const;

/**
 * Helper function to calculate pagination metadata
 */
export function createPaginationMeta(
  page: number,
  limit: number,
  totalItems: number
): PaginationMeta {
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Helper function to validate and normalize pagination parameters
 */
export function normalizePaginationQuery(query: PaginationQuery): {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
} {
  const page = Math.max(
    PAGINATION_DEFAULTS.PAGE,
    Math.min(Number(query.page) || PAGINATION_DEFAULTS.PAGE, 10000)
  );
  
  const limit = Math.max(
    PAGINATION_DEFAULTS.MIN_LIMIT,
    Math.min(
      Number(query.limit) || PAGINATION_DEFAULTS.LIMIT,
      PAGINATION_DEFAULTS.MAX_LIMIT
    )
  );
  
  return {
    page,
    limit,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder === 'desc' ? 'desc' : 'asc',
  };
}

/**
 * Calculate offset from page and limit
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Search query with pagination
 */
export interface SearchQuery extends PaginationQuery {
  search?: string;
  fields?: string[];
}

/**
 * Date range filter
 */
export interface DateRangeFilter {
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Generic filter options base
 */
export interface BaseFilterOptions extends PaginationQuery {
  isActive?: boolean;
  createdFrom?: Date;
  createdTo?: Date;
}
