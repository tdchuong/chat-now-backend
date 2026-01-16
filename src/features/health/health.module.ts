// health.module.ts
import { HealthController } from '@/features/health/health.controller';
import { RedisHealthIndicator } from '@/features/health/redis/redis.health.indicator';
import { Module } from '@nestjs/common';
import { PrismaHealthIndicator, TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [RedisHealthIndicator, PrismaHealthIndicator],
})
export class HealthModule {}
