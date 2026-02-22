import { z } from 'zod';

export const configuration = () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '13101', 10),
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/inventory?schema=public',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cors: {
    origins: process.env.CORS_ORIGINS || 'http://localhost:13100',
  },
  logLevel: process.env.LOG_LEVEL || 'info',
  app: {
    name: 'Inventory Management System',
    version: '1.0.0',
  },
});

// Validation schema for environment variables
export const validationSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform(Number).default('13101'),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32).optional(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  CORS_ORIGINS: z.string().optional(),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
});
