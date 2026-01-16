export interface RedisHealthStatus {
  isHealthy: boolean;
  status: 'ready' | 'connecting' | 'reconnecting' | 'error' | 'end';
  lastError?: string;
  uptime?: number;
  memoryUsage?: string;
  reconnectAttempts?: number;
}

export interface RedisMetrics {
  totalConnections: number;
  totalCommands: number;
  totalErrors: number;
  avgResponseTime?: number;
}

// ==================== REDIS SERVICE ====================

import { AppConfigService } from '@/common/env/config.service';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import Redis, { Redis as RedisClient, RedisOptions } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClient;
  private connectionState = {
    isConnected: false,
    startTime: 0,
    reconnectAttempts: 0,
    lastError: null as Error | null,
  };

  constructor(private readonly configService: AppConfigService) {}

  // ==================== LIFECYCLE HOOKS ====================

  async onModuleInit(): Promise<void> {
    await this.initialize();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  // ==================== INITIALIZATION ====================

  private async initialize(): Promise<void> {
    const config = this.buildRedisConfig();
    this.client = new Redis(config);
    this.setupEventListeners();

    try {
      this.connectionState.startTime = Date.now();
      this.logger.log('✅ Redis connected successfully');
    } catch (error) {
      this.handleConnectionError(error);
      throw error;
    }
  }

  private buildRedisConfig(): RedisOptions {
    const redisConfig = this.configService.redisConfig;

    return {
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      db: 0,
      maxRetriesPerRequest: redisConfig.maxRetriesPerRequest, // Số lần thử lại 1 request trước khi báo lỗi
      enableReadyCheck: redisConfig.enableReadyCheck, // Kiểm tra Redis đã sẵn sàng chưa trước khi dùng
      enableOfflineQueue: redisConfig.enableOfflineQueue, // Lưu command vào queue khi chưa kết nối Redis
      connectTimeout: redisConfig.connectTimeout, // Thời gian tối đa chờ kết nối Redis
      keepAlive: 30000, // Giữ kết nối TCP sống 30 giây/lần
      family: 4, // Dùng IPv4
      retryStrategy: this.createRetryStrategy(redisConfig.maxRetriesPerRequest), // Logic retry khi mất kết nối
      reconnectOnError: this.createReconnectOnErrorHandler(),
      // Tự động reconnect khi gặp lỗi có thể phục hồi
    };
  }

  private createRetryStrategy(maxRetries: number) {
    return (times: number): number | null => {
      this.connectionState.reconnectAttempts = times;

      if (times > maxRetries) {
        this.logger.error(
          `Connection failed after ${times} retries. Giving up.`,
        );
        return null;
      }

      const delay = Math.min(Math.pow(2, times) * 1000, 10000);
      this.logger.warn(`Retry attempt ${times}. Reconnecting in ${delay}ms...`);
      return delay;
    };
  }

  private createReconnectOnErrorHandler() {
    return (err: Error): boolean => {
      this.logger.error(`Reconnect on error: ${err.message}`);
      const reconnectErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT'];
      return reconnectErrors.some((error) => err.message.includes(error));
    };
  }

  // ==================== EVENT HANDLERS ====================

  private setupEventListeners(): void {
    this.client.on('connect', () => this.handleConnect());
    this.client.on('ready', () => this.handleReady());
    this.client.on('error', (error) => this.handleError(error));
    this.client.on('close', () => this.handleClose());
    this.client.on('reconnecting', (ms) => this.handleReconnecting(ms));
    this.client.on('end', () => this.handleEnd());
  }

  private handleConnect(): void {
    this.logger.log('🔄 Connecting...');
  }

  private handleReady(): void {
    this.connectionState.isConnected = true;
    this.connectionState.reconnectAttempts = 0;
    this.logger.log('✅ Redis ready');
  }

  private handleError(error: Error): void {
    this.connectionState.lastError = error;
    this.logger.error(`❌ Redis error: ${error.message}`, error.stack);
  }

  private handleClose(): void {
    this.connectionState.isConnected = false;
    this.logger.warn('⚠️ Connection closed');
  }

  private handleReconnecting(ms: number): void {
    this.logger.warn(`🔄 Reconnecting in ${ms}ms...`);
  }

  private handleEnd(): void {
    this.connectionState.isConnected = false;
    this.logger.warn('⚠️ Connection ended');
  }

  private handleConnectionError(error: unknown): void {
    const err = error as Error;
    this.connectionState.lastError = err;
    this.logger.error('❌ Connection failed:', err);
  }

  // ==================== DISCONNECT ====================

  private async disconnect(): Promise<void> {
    if (!this.client || !this.connectionState.isConnected) {
      return;
    }
    try {
      await this.client.quit();
      this.logger.log('Redis disconnected gracefully');
    } catch (error) {
      this.logger.error('Error during disconnect:', error);
      this.client?.disconnect();
    }
  }

  // ==================== LUA SCRIPT OPERATIONS ====================

  async executeScript(
    script: string,
    keys: string[],
    args: (string | number)[],
  ): Promise<any> {
    return this.executeWithErrorHandling('EVAL', async () =>
      this.client.eval(script, keys.length, ...keys, ...args),
    );
  }

  async executeScriptBySha(
    sha: string,
    keys: string[],
    args: (string | number)[],
    fallbackScript?: string,
  ): Promise<any> {
    try {
      return await this.executeWithErrorHandling('EVALSHA', async () =>
        this.client.evalsha(sha, keys.length, ...keys, ...args),
      );
    } catch (error) {
      if (this.isNoScriptError(error) && fallbackScript) {
        this.logger.warn(`Script SHA ${sha} not found, using fallback`);
        return this.executeScript(fallbackScript, keys, args);
      }
      throw error;
    }
  }

  async loadScript(script: string): Promise<any> {
    const sha = await this.executeWithErrorHandling('SCRIPT LOAD', async () =>
      this.client.script('LOAD', script),
    );
    this.logger.debug(`Script loaded with SHA: ${sha}`);
    return sha;
  }

  private isNoScriptError(error: any): boolean {
    return error?.message?.includes('NOSCRIPT') ?? false;
  }

  // ==================== BASIC OPERATIONS ====================

  async get(key: string): Promise<string | null> {
    return this.executeWithErrorHandling(`GET ${key}`, async () =>
      this.client.get(key),
    );
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<'OK'> {
    return this.executeWithErrorHandling(`SET ${key}`, async () => {
      if (ttlSeconds && ttlSeconds > 0) {
        return this.client.setex(key, ttlSeconds, value);
      }
      return this.client.set(key, value);
    });
  }

  async setObject<T>(
    key: string,
    value: T,
    ttlSeconds?: number,
  ): Promise<'OK'> {
    const serialized = JSON.stringify(value);
    return this.set(key, serialized, ttlSeconds);
  }

  async getObject<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    return value ? JSON.parse(value) : null;
  }

  async delete(key: string): Promise<number> {
    return this.executeWithErrorHandling(`DEL ${key}`, async () =>
      this.client.del(key),
    );
  }

  async deleteMany(keys: string[]): Promise<number> {
    if (keys.length === 0) return 0;

    return this.executeWithErrorHandling(`DEL ${keys.length} keys`, async () =>
      this.client.del(...keys),
    );
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.executeWithErrorHandling(
      `EXISTS ${key}`,
      async () => this.client.exists(key),
    );
    return result === 1;
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    const result = await this.executeWithErrorHandling(
      `EXPIRE ${key}`,
      async () => this.client.expire(key, seconds),
    );
    return result === 1;
  }

  async ttl(key: string): Promise<number> {
    return this.executeWithErrorHandling(`TTL ${key}`, async () =>
      this.client.ttl(key),
    );
  }

  // ==================== PATTERN OPERATIONS ====================

  async scan(pattern: string, count: number = 100): Promise<string[]> {
    const keys: string[] = [];
    let cursor = '0';

    do {
      const [newCursor, foundKeys] = await this.executeWithErrorHandling(
        `SCAN ${pattern}`,
        async () => this.client.scan(cursor, 'MATCH', pattern, 'COUNT', count),
      );
      cursor = newCursor;
      keys.push(...foundKeys);
    } while (cursor !== '0');

    return keys;
  }

  /**
   * @deprecated Use scan() instead for production safety
   */
  async keys(pattern: string): Promise<string[]> {
    this.logger.warn('KEYS command used - consider using SCAN for production');
    return this.executeWithErrorHandling(`KEYS ${pattern}`, async () =>
      this.client.keys(pattern),
    );
  }

  // ==================== SORTED SET OPERATIONS ====================

  async zAdd(key: string, score: number, member: string): Promise<number> {
    return this.executeWithErrorHandling(`ZADD ${key}`, async () =>
      this.client.zadd(key, score, member),
    );
  }

  async zRemove(key: string, member: string): Promise<number> {
    return this.executeWithErrorHandling(`ZREM ${key}`, async () =>
      this.client.zrem(key, member),
    );
  }

  async zRange(key: string, start: number, stop: number): Promise<string[]> {
    return this.executeWithErrorHandling(`ZRANGE ${key}`, async () =>
      this.client.zrange(key, start, stop),
    );
  }

  async zCard(key: string): Promise<number> {
    return this.executeWithErrorHandling(`ZCARD ${key}`, async () =>
      this.client.zcard(key),
    );
  }

  // ==================== HASH OPERATIONS ====================

  async hSet(key: string, field: string, value: string): Promise<number> {
    return this.executeWithErrorHandling(`HSET ${key}`, async () =>
      this.client.hset(key, field, value),
    );
  }

  async hGet(key: string, field: string): Promise<string | null> {
    return this.executeWithErrorHandling(`HGET ${key}`, async () =>
      this.client.hget(key, field),
    );
  }

  async hGetAll(key: string): Promise<Record<string, string>> {
    return this.executeWithErrorHandling(`HGETALL ${key}`, async () =>
      this.client.hgetall(key),
    );
  }

  async hDelete(key: string, field: string): Promise<number> {
    return this.executeWithErrorHandling(`HDEL ${key}`, async () =>
      this.client.hdel(key, field),
    );
  }

  // ==================== PIPELINE & TRANSACTION ====================

  async executePipeline(commands: Array<[string, ...any[]]>): Promise<any> {
    return this.executeWithErrorHandling('PIPELINE', async () => {
      const pipeline = this.client.pipeline(commands);
      return pipeline.exec();
    });
  }

  async executeTransaction(commands: Array<[string, ...any[]]>): Promise<any> {
    return this.executeWithErrorHandling('MULTI/EXEC', async () => {
      const multi = this.client.multi(commands);
      return multi.exec();
    });
  }

  // ==================== UTILITY METHODS ====================

  getClient(): RedisClient {
    this.ensureConnection();
    return this.client;
  }

  isConnected(): boolean {
    return this.connectionState.isConnected && this.client?.status === 'ready';
  }

  async ping(): Promise<string> {
    return this.executeWithErrorHandling('PING', async () =>
      this.client.ping(),
    );
  }

  async healthCheck(): Promise<RedisHealthStatus> {
    try {
      await this.ping();

      const info = await this.client.info('memory');
      const memoryUsage = this.extractMemoryUsage(info);

      return {
        isHealthy: true,
        status: this.client.status as any,
        uptime: this.getUptime(),
        memoryUsage,
        reconnectAttempts: this.connectionState.reconnectAttempts,
      };
    } catch (error) {
      return {
        isHealthy: false,
        status: 'error',
        lastError: (error as Error).message,
        reconnectAttempts: this.connectionState.reconnectAttempts,
      };
    }
  }

  // ==================== PRIVATE HELPER METHODS ====================

  private async executeWithErrorHandling<T>(
    operation: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    this.ensureConnection();

    try {
      return await fn();
    } catch (error) {
      const err = error as Error;
      this.logger.error(`${operation} failed: ${err.message}`, err.stack);
      throw new Error(`Redis ${operation} error: ${err.message}`);
    }
  }

  private ensureConnection(): void {
    if (!this.isConnected()) {
      throw new Error(
        `Redis not connected. Status: ${this.client?.status || 'unknown'}`,
      );
    }
  }

  private getUptime(): number | undefined {
    return this.connectionState.startTime
      ? Date.now() - this.connectionState.startTime
      : undefined;
  }

  private extractMemoryUsage(info: string): string {
    const match = info.match(/used_memory_human:(.+)/);
    return match?.[1]?.trim() ?? 'unknown';
  }

  /**
   * Force disconnect (emergency use only)
   */
  async forceDisconnect(): Promise<void> {
    this.client?.disconnect();
    this.connectionState.isConnected = false;
    this.logger.warn('Redis force disconnected');
  }
}
