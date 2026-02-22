import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false,
    }),
    {
      bufferLogs: true,
    },
  );

  // Use Pino logger
  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:13100'],
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 13101;
  await app.listen(port, '0.0.0.0');

  const logger = app.get(Logger);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger docs: http://localhost:${port}/api/docs`);
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('Bootstrap failed:', error);
  process.exit(1);
});
