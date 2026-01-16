import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3', 10),
  retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY|| '3000', 10),
  enableReadyCheck: true,
  enableOfflineQueue: false,
  connectTimeout: 10000,
  lazyConnect: true,
}));
