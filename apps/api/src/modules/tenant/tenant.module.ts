import { Module, Global } from '@nestjs/common';
import { TenantMiddleware } from './tenant.middleware';

@Global()
@Module({
  providers: [],
  exports: [],
})
export class TenantModule {
  configure(consumer: any) {
    consumer.apply(TenantMiddleware).exclude('auth').forRoutes('*');
  }
}
