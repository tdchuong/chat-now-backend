import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { RedisService } from '@/common/redis/redis.service';

@Injectable()
export class RedisHealthIndicator {
  constructor(
    private readonly redisService: RedisService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  /**
   * Kiểm tra trạng thái Redis
   * @param key tên indicator, ví dụ: "redis"
   * @returns object { status: 'up' | 'down', ... }
   */
  async isHealthy(key: string) {
    // const health = await this.redisService.healthCheck(key);
    
  }
}
