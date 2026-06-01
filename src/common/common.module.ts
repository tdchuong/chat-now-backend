import { AppConfigService } from '@/common/env/config.service';
import { TokenService } from '@/features/auth/services/token.service';
import { RedisService } from '@/common/redis/redis.service';
import { Global, Module } from '@nestjs/common';
import { jwtConfigModule } from '@/config/jwt/jwt-config.module';
import { LoginRedisSession } from '@/features/auth/redis/login-redis.session.redis';
import { TokenCookieService } from '@/features/auth/services/token-cookie.service';
@Global()
@Module({
  imports: [jwtConfigModule],
  providers: [
    AppConfigService,
    TokenService,
    RedisService,
    LoginRedisSession,
    TokenCookieService,
  ],
  exports: [
    AppConfigService,
    TokenService,
    RedisService,
    LoginRedisSession,
    TokenCookieService,
  ],
})
export class CommonModule {}
