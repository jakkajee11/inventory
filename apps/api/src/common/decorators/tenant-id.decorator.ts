import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extended request interface with tenant information
 */
interface RequestWithTenant {
  user?: {
    companyId: string;
  };
  tenantId?: string;
  headers: Record<string, string | undefined>;
}

/**
 * @TenantId() decorator
 * Extracts the tenant ID (company ID) from the request
 *
 * The tenant ID can come from:
 * 1. JWT token (user.companyId)
 * 2. Request object set by TenantMiddleware
 * 3. X-Tenant-ID header (fallback)
 *
 * Usage:
 * - @TenantId() tenantId: string
 */
export const TenantId = createParamDecorator(
  (data: unknown, context: ExecutionContext): string | null => {
    const request = context.switchToHttp().getRequest<RequestWithTenant>();

    // First, try to get tenant ID from authenticated user
    if (request.user?.companyId) {
      return request.user.companyId;
    }

    // Second, try to get from tenant middleware
    if (request.tenantId) {
      return request.tenantId;
    }

    // Finally, fallback to header
    const headerTenantId = request.headers['x-tenant-id'];
    if (headerTenantId) {
      return headerTenantId;
    }

    return null;
  },
);

/**
 * @RequireTenant() decorator
 * Throws an error if tenant ID is not present
 * Use this for endpoints that strictly require tenant context
 */
export const RequireTenant = createParamDecorator(
  (data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest<RequestWithTenant>();

    const tenantId =
      request.user?.companyId ||
      request.tenantId ||
      request.headers['x-tenant-id'];

    if (!tenantId) {
      throw new Error('Tenant ID is required but not provided');
    }

    return tenantId;
  },
);
