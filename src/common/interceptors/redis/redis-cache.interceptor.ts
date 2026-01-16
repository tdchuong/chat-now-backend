import { REDIS_CACHE_KEY, REDIS_CACHE_TTL } from '@/common/decorators/redis-cache.decorator';
import { RedisService } from '@/common/redis/redis.service';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';


@Injectable()
export class RedisCacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RedisCacheInterceptor.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const cacheKey = this.reflector.get<string>(
      REDIS_CACHE_KEY,
      context.getHandler(),
    );

    const ttl = this.reflector.get<number>(
      REDIS_CACHE_TTL,
      context.getHandler(),
    );

    if (!cacheKey) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const fullKey = this.buildCacheKey(cacheKey, request);

    try {
      // Try to get from cache
      const cached = await this.redisService.getObject(fullKey);

      if (cached !== null) {
        this.logger.debug(`Cache hit: ${fullKey}`);
        return of(cached);
      }

      // Cache miss - execute and cache result
      return next.handle().pipe(
        tap(async (data) => {
          try {
            await this.redisService.setObject(fullKey, data, ttl);
            this.logger.debug(`Cached: ${fullKey} (TTL: ${ttl}s)`);
          } catch (error) {
            this.logger.error(`Failed to cache ${fullKey}:`, error);
          }
        }),
      );
    } catch (error) {
      this.logger.error(`Cache error for ${fullKey}:`, error);
      return next.handle();
    }
  }

  private buildCacheKey(key: string, request: any): string {
    // You can customize this based on query params, user, etc.
    const userId = request.user?.id || 'anonymous';
    return `${key}:${userId}`;
  }
}
