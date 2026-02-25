import { Controller, Get } from '@nestjs/common';
import { HealthCheckService } from '@nestjs/terminus';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheckResult } from '@nestjs/terminus';
import { Public } from '../decorators/public.decorator';

@Controller('health')
@ApiTags('Health')
@Public()
export class HealthController {
  constructor(private readonly health: HealthCheckService) {}

  @Get()
  check(): Promise<HealthCheckResult> {
    return this.health.check([]);
  }
}