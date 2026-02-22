/**
 * Public decorator
 * Marks a route as public (bypasses JWT authentication)
 */

/**
 * Metadata key for marking routes as public
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * @Public() decorator
 * Use this to mark routes that don't require authentication
 *
 * @example
 * @Public()
 * @Get('health')
 * healthCheck() {
 *   return { status: 'ok' };
 * }
 */
export const Public = (): MethodDecorator & ClassDecorator => {
  return (
    target: unknown,
    key?: string | symbol,
    descriptor?: TypedPropertyDescriptor<unknown>,
  ) => {
    if (descriptor) {
      Reflect.defineMetadata(IS_PUBLIC_KEY, true, descriptor.value);
      return descriptor;
    }
    // Class decorator
    Reflect.defineMetadata(IS_PUBLIC_KEY, true, target);
    return target as new (...args: unknown[]) => unknown;
  };
};
