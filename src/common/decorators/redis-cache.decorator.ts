import { REDIS_DEFAULT_TTL } from '@/common/redis/redis.constants';
import { OnModuleInit, SetMetadata } from '@nestjs/common';

export const REDIS_CACHE_KEY = 'redis:cache';
export const REDIS_CACHE_TTL = 'redis:cache:ttl';

export interface RedisCacheOptions {
  key?: string;
  ttl?: number;
  prefix?: string;
}

export const RedisCache = (options: RedisCacheOptions = {}) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(REDIS_CACHE_KEY, options.key)(target, propertyKey, descriptor);
    SetMetadata(REDIS_CACHE_TTL, options.ttl ?? REDIS_DEFAULT_TTL.MEDIUM)(
      target,
      propertyKey,
      descriptor,
    );
    return descriptor;
  };
};
