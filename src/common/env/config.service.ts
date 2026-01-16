import { AppConfig } from '@/config/env/interfaces/app-config.interface';
import { DatabaseConfig } from '@/config/env/interfaces/database-config.interface';
import { JwtConfig } from '@/config/env/interfaces/jwt-config.interface';
import { RedisConfig } from '@/config/env/interfaces/redis-config.interface';
import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: NestConfigService) {}

  get appConfig(): AppConfig {
    return this.configService.get('app')!;
  }

  get isDevelopment(): boolean {
    return this.appConfig.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.appConfig.nodeEnv === 'production';
  }
  get databaseConfig(): DatabaseConfig {
    return this.configService.get('database')!;
  }

  get jwtConfig(): JwtConfig {
    return this.configService.get('jwt')!;
  }

  get redisConfig(): RedisConfig {
    return this.configService.get('redis')!;
  }

}
