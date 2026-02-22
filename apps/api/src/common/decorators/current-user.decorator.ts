import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestUser } from '../guards/roles.guard';

/**
 * @CurrentUser() decorator
 * Extracts the authenticated user from the request object
 *
 * Usage examples:
 * - @CurrentUser() user: RequestUser
 * - @CurrentUser('id') userId: string
 * - @CurrentUser('companyId') tenantId: string
 */
export const CurrentUser = createParamDecorator(
  (data: keyof RequestUser | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user: RequestUser = request.user;

    if (!user) {
      return null;
    }

    // If a specific property is requested, return it
    if (data) {
      return user[data];
    }

    // Otherwise return the entire user object
    return user;
  },
);

/**
 * Type for the user returned by @CurrentUser() decorator
 */
export type CurrentUserType = RequestUser;
