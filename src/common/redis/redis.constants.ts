export const REDIS_KEY_PREFIXES = {
  CACHE: 'cache',
  SESSION: 'session',
  RATE_LIMIT: 'rate',
  LOCK: 'lock',
  QUEUE: 'queue',
  COUNTER: 'counter',
} as const;

export const REDIS_DEFAULT_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
} as const;
