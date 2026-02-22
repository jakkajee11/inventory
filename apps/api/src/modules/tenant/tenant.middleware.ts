import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Extract tenant ID from JWT or header
    // For now, this is a placeholder
    const tenantId = req.headers['x-tenant-id'] as string;
    (req as Request & { tenantId?: string }).tenantId = tenantId;
    next();
  }
}
