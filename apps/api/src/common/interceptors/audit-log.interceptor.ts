import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  Optional,
} from '@nestjs/common';
import { Observable, tap, catchError } from 'rxjs';
import { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';

/**
 * Audit log action types
 */
export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
}

/**
 * Audit log entry interface
 */
export interface AuditLogEntry {
  userId: string | null;
  companyId: string | null;
  action: AuditAction;
  entityType: string;
  entityId: string | null;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  requestMethod: string;
  requestPath: string;
  statusCode: number | null;
  duration: number;
  timestamp: Date;
  error: string | null;
}

/**
 * Metadata key for audit configuration
 */
export const AUDIT_CONFIG_KEY = 'audit_config';

/**
 * Audit configuration interface
 */
export interface AuditConfig {
  action: AuditAction;
  entityType: string;
  extractEntityId?: (request: Request) => string | null;
  extractOldValues?: (request: Request) => Record<string, unknown> | null;
  extractNewValues?: (request: Request, response: unknown) => Record<string, unknown> | null;
}

/**
 * Decorator to configure audit logging for a specific endpoint
 */
export const AuditLog = (config: AuditConfig) => {
  return (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) => {
    Reflect.defineMetadata(AUDIT_CONFIG_KEY, config, descriptor.value);
    return descriptor;
  };
};

/**
 * Audit Log Interceptor
 * Automatically logs user actions for audit trail
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    @Optional()
    @Inject('AUDIT_LOGGER')
    private readonly logger: PinoLogger,
  ) {
    if (!this.logger) {
      this.logger = new PinoLogger({});
    }
    this.logger.setContext(AuditLogInterceptor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const startTime = Date.now();

    // Get audit configuration from decorator
    const auditConfig: AuditConfig | undefined = Reflect.getMetadata(
      AUDIT_CONFIG_KEY,
      context.getHandler(),
    );

    // Extract user information
    const user = request.user as {
      id?: string;
      companyId?: string;
    } | undefined;

    // Build initial audit entry
    const auditEntry: Partial<AuditLogEntry> = {
      userId: user?.id ?? null,
      companyId: user?.companyId ?? null,
      action: auditConfig?.action ?? this.inferActionFromMethod(request.method),
      entityType: auditConfig?.entityType ?? this.inferEntityType(request.path),
      entityId: auditConfig?.extractEntityId?.(request) ?? this.extractEntityIdFromPath(request.path),
      oldValues: auditConfig?.extractOldValues?.(request) ?? null,
      ipAddress: this.extractIpAddress(request),
      userAgent: request.headers['user-agent'] ?? null,
      requestMethod: request.method,
      requestPath: request.path,
      timestamp: new Date(),
    };

    return next.handle().pipe(
      tap((response: unknown) => {
        const duration = Date.now() - startTime;

        // Extract new values from response if configured
        const newValues = auditConfig?.extractNewValues?.(request, response) ?? null;

        const completeEntry: AuditLogEntry = {
          ...auditEntry as AuditLogEntry,
          newValues,
          statusCode: context.switchToHttp().getResponse<Response>().statusCode,
          duration,
          error: null,
        };

        this.logAuditEntry(completeEntry);
      }),
      catchError((error: Error) => {
        const duration = Date.now() - startTime;

        const errorEntry: AuditLogEntry = {
          ...auditEntry as AuditLogEntry,
          newValues: null,
          statusCode: null,
          duration,
          error: error.message,
        };

        this.logAuditEntry(errorEntry);

        throw error;
      }),
    );
  }

  /**
   * Infer audit action from HTTP method
   */
  private inferActionFromMethod(method: string): AuditAction {
    const actionMap: Record<string, AuditAction> = {
      GET: AuditAction.READ,
      POST: AuditAction.CREATE,
      PUT: AuditAction.UPDATE,
      PATCH: AuditAction.UPDATE,
      DELETE: AuditAction.DELETE,
    };
    return actionMap[method.toUpperCase()] ?? AuditAction.READ;
  }

  /**
   * Infer entity type from request path
   */
  private inferEntityType(path: string): string {
    const segments = path.split('/').filter(Boolean);
    // Usually the entity is after '/api/' or at a specific position
    const apiIndex = segments.indexOf('api');
    if (apiIndex !== -1 && segments.length > apiIndex + 1) {
      return segments[apiIndex + 1].toUpperCase();
    }
    // Fallback to first segment
    return segments[0]?.toUpperCase() ?? 'UNKNOWN';
  }

  /**
   * Extract entity ID from path (usually the last UUID segment)
   */
  private extractEntityIdFromPath(path: string): string | null {
    const uuidRegex =
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const match = path.match(uuidRegex);
    return match ? match[0] : null;
  }

  /**
   * Extract IP address from request
   */
  private extractIpAddress(request: Request): string | null {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      request.socket?.remoteAddress ??
      null
    );
  }

  /**
   * Log the audit entry
   * In production, this should write to a persistent audit log store
   */
  private logAuditEntry(entry: AuditLogEntry): void {
    const entityIdStr = entry.entityId ? ` (${entry.entityId})` : '';
    const userIdStr = entry.userId ?? 'anonymous';
    const message = `Audit: ${entry.action} on ${entry.entityType}${entityIdStr} by ${userIdStr}`;

    this.logger.info(
      {
        audit: {
          userId: entry.userId,
          companyId: entry.companyId,
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId,
          requestMethod: entry.requestMethod,
          requestPath: entry.requestPath,
          statusCode: entry.statusCode,
          duration: entry.duration,
          error: entry.error,
        },
      },
      message,
    );

    // TODO: In production, also write to database via Prisma
    // await this.prisma.auditLog.create({ data: entry });
  }
}
