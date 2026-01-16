import { REDIS_KEY_PREFIXES } from '@/common/redis/redis.constants';

export class RedisKeyBuilder {
  /**
   * Build a cache key
   */
  static cache(entity: string, id: string | number): string {
    return `${REDIS_KEY_PREFIXES.CACHE}:${entity}:${id}`;
  }

  /**
   * Build a session key
   */
  static session(sessionId: string): string {
    return `${REDIS_KEY_PREFIXES.SESSION}:${sessionId}`;
  }

  /**
   * Build a rate limit key
   */
  static rateLimit(identifier: string, endpoint: string): string {
    return `${REDIS_KEY_PREFIXES.RATE_LIMIT}:${endpoint}:${identifier}`;
  }

  /**
   * Build a distributed lock key
   */
  static lock(resource: string): string {
    return `${REDIS_KEY_PREFIXES.LOCK}:${resource}`;
  }

  /**
   * Build a counter key
   */
  static counter(name: string): string {
    return `${REDIS_KEY_PREFIXES.COUNTER}:${name}`;
  }

  /**
   * Build a custom key with prefix
   */
  static custom(prefix: string, ...parts: (string | number)[]): string {
    return [prefix, ...parts].join(':');
  }


}
