import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * JWT Authentication Guard
 * Validates JWT tokens and attaches user information to the request
 *
 * This guard works in conjunction with Passport's JWT strategy.
 * The JWT strategy validates the token and attaches the user to the request.
 * This guard checks for the user's presence and handles public routes.
 *
 * @example
 * // Apply globally in app.module.ts
 * providers: [
 *   {
 *     provide: APP_GUARD,
 *     useClass: JwtAuthGuard,
 *   },
 * ]
 *
 * // Or apply to specific controllers
 * @UseGuards(JwtAuthGuard)
 * export class ProductsController { ... }
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    return true;
  }
}
