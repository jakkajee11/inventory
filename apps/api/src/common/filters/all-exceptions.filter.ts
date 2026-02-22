import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
  Optional,
  LoggerService,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { Prisma } from '@prisma/client';

/**
 * Standard error response format
 */
export interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  errorCode?: string;
  details?: Record<string, unknown>;
  timestamp: string;
  path: string;
  method: string;
  requestId?: string;
}

/**
 * Error codes for different error types
 */
export enum ErrorCode {
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // Authorization errors
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',

  // Database errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  UNIQUE_CONSTRAINT_VIOLATION = 'UNIQUE_CONSTRAINT_VIOLATION',
  FOREIGN_KEY_CONSTRAINT = 'FOREIGN_KEY_CONSTRAINT',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',

  // Business logic errors
  BUSINESS_ERROR = 'BUSINESS_ERROR',
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  INVALID_STATUS_TRANSITION = 'INVALID_STATUS_TRANSITION',
  SELF_APPROVAL_NOT_ALLOWED = 'SELF_APPROVAL_NOT_ALLOWED',

  // System errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

/**
 * Global Exception Filter
 * Catches all exceptions and returns consistent error responses
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    @Optional()
    @Inject('EXCEPTION_LOGGER')
    private readonly logger: LoggerService,
  ) {
    if (!this.logger) {
      this.logger = new PinoLogger({});
    }
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request);

    // Log the error
    this.logError(exception, request, errorResponse);

    // Send response
    response.status(errorResponse.statusCode).json(errorResponse);
  }

  /**
   * Build a standardized error response
   */
  private buildErrorResponse(exception: unknown, request: Request): ErrorResponse {
    const baseResponse: ErrorResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: ErrorCode.INTERNAL_ERROR,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      requestId: request.headers['x-request-id'] as string,
    };

    // Handle HTTP exceptions
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception, baseResponse);
    }

    // Handle Prisma errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handlePrismaError(exception, baseResponse);
    }

    // Handle validation errors (class-validator)
    if (this.isValidationError(exception)) {
      return this.handleValidationError(exception, baseResponse);
    }

    // Handle generic errors
    if (exception instanceof Error) {
      baseResponse.message = exception.message;
      if (process.env.NODE_ENV !== 'production') {
        baseResponse.details = { stack: exception.stack };
      }
    }

    return baseResponse;
  }

  /**
   * Handle HTTP exceptions
   */
  private handleHttpException(
    exception: HttpException,
    baseResponse: ErrorResponse,
  ): ErrorResponse {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    baseResponse.statusCode = status;

    if (typeof exceptionResponse === 'string') {
      baseResponse.message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const response = exceptionResponse as Record<string, unknown>;
      baseResponse.message = (response.message as string) || exception.message;

      if (response.error) {
        baseResponse.error = response.error as string;
      }

      // Handle class-validator errors
      if (Array.isArray(response.message)) {
        baseResponse.details = { validationErrors: response.message };
        baseResponse.error = ErrorCode.VALIDATION_ERROR;
      }
    }

    // Map status codes to error codes
    baseResponse.errorCode = this.mapStatusToErrorCode(status);

    return baseResponse;
  }

  /**
   * Handle Prisma database errors
   */
  private handlePrismaError(
    exception: Prisma.PrismaClientKnownRequestError,
    baseResponse: ErrorResponse,
  ): ErrorResponse {
    switch (exception.code) {
      case 'P2002':
        // Unique constraint violation
        baseResponse.statusCode = HttpStatus.CONFLICT;
        baseResponse.error = ErrorCode.UNIQUE_CONSTRAINT_VIOLATION;
        baseResponse.errorCode = 'P2002';
        const meta = exception.meta as { target?: string[] } | undefined;
        const target = meta?.target?.join(', ') ?? 'field';
        baseResponse.message = `A record with this ${target} already exists`;
        break;

      case 'P2025':
        // Record not found
        baseResponse.statusCode = HttpStatus.NOT_FOUND;
        baseResponse.error = ErrorCode.RECORD_NOT_FOUND;
        baseResponse.errorCode = 'P2025';
        baseResponse.message = 'Record not found';
        break;

      case 'P2003':
        // Foreign key constraint violation
        baseResponse.statusCode = HttpStatus.BAD_REQUEST;
        baseResponse.error = ErrorCode.FOREIGN_KEY_CONSTRAINT;
        baseResponse.errorCode = 'P2003';
        baseResponse.message = 'Referenced record does not exist';
        break;

      case 'P2014':
        // Relation violation
        baseResponse.statusCode = HttpStatus.BAD_REQUEST;
        baseResponse.error = ErrorCode.DATABASE_ERROR;
        baseResponse.errorCode = 'P2014';
        baseResponse.message = 'Invalid relation';
        break;

      default:
        baseResponse.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        baseResponse.error = ErrorCode.DATABASE_ERROR;
        baseResponse.errorCode = exception.code;
        baseResponse.message = 'Database error occurred';
    }

    return baseResponse;
  }

  /**
   * Check if error is a validation error
   */
  private isValidationError(exception: unknown): boolean {
    if (exception instanceof Error) {
      return (
        exception.constructor.name === 'ValidationError' ||
        exception.message.includes('validation failed')
      );
    }
    return false;
  }

  /**
   * Handle validation errors
   */
  private handleValidationError(
    exception: Error,
    baseResponse: ErrorResponse,
  ): ErrorResponse {
    baseResponse.statusCode = HttpStatus.BAD_REQUEST;
    baseResponse.error = ErrorCode.VALIDATION_ERROR;
    baseResponse.message = 'Validation failed';
    baseResponse.details = { errors: exception.message };

    return baseResponse;
  }

  /**
   * Map HTTP status codes to error codes
   */
  private mapStatusToErrorCode(status: number): ErrorCode {
    const mapping: Record<number, ErrorCode> = {
      [HttpStatus.UNAUTHORIZED]: ErrorCode.UNAUTHORIZED,
      [HttpStatus.FORBIDDEN]: ErrorCode.FORBIDDEN,
      [HttpStatus.NOT_FOUND]: ErrorCode.NOT_FOUND,
      [HttpStatus.BAD_REQUEST]: ErrorCode.INVALID_INPUT,
      [HttpStatus.CONFLICT]: ErrorCode.BUSINESS_ERROR,
      [HttpStatus.TOO_MANY_REQUESTS]: ErrorCode.RATE_LIMIT_EXCEEDED,
      [HttpStatus.SERVICE_UNAVAILABLE]: ErrorCode.SERVICE_UNAVAILABLE,
    };

    return mapping[status] ?? ErrorCode.INTERNAL_ERROR;
  }

  /**
   * Log the error with appropriate level
   */
  private logError(
    exception: unknown,
    request: Request,
    errorResponse: ErrorResponse,
  ): void {
    const logContext = {
      statusCode: errorResponse.statusCode,
      method: request.method,
      path: request.url,
      error: errorResponse.error,
      message: errorResponse.message,
      userId: (request.user as { id?: string })?.id,
      tenantId: (request.user as { companyId?: string })?.companyId,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    };

    if (errorResponse.statusCode >= 500) {
      this.logger.error?.(
        {
          ...logContext,
          stack: exception instanceof Error ? exception.stack : undefined,
        },
        `Server Error: ${errorResponse.message}`,
      );
    } else if (errorResponse.statusCode >= 400) {
      this.logger.warn?.(logContext, `Client Error: ${errorResponse.message}`);
    } else {
      this.logger.debug?.(logContext, `Request Error: ${errorResponse.message}`);
    }
  }
}
