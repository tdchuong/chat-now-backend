export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  maxRetriesPerRequest: number;
  retryDelayOnFailover: number;
  enableReadyCheck: boolean;
  enableOfflineQueue: boolean;
  connectTimeout: number;
}
