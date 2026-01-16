import { AppConfigService } from '@/common/env/config.service';
import { TokenService } from '@/common/token/token.service';
import { RedisService } from '@/common/redis/redis.service';
import { AuthenticatedUserService } from '@/common/services/authenticated-user.service';
import { Global, Module } from '@nestjs/common';
import { jwtConfigModule } from '@/config/jwt/jwt-config.module';
import { LoginRedisSession } from '@/common/redis/auth/login-redis.session';
import { CookieService } from '@/common/cookies/cookie.service';
import { JwtStrategy } from '@/common/strategies/jwt.strategy';
import { LocalStrategy } from '@/common/strategies/local.strategy';
import { LocalAuthGuard } from '@/common/guards/local-auth.guard';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
@Global()
@Module({
  imports: [jwtConfigModule],
  providers: [
    AppConfigService,
    AuthenticatedUserService,
    TokenService,
    RedisService,
    LoginRedisSession,
    CookieService,
    JwtStrategy,
    LocalStrategy,
    JwtAuthGuard,
    LocalAuthGuard,
  ],
  exports: [
    AppConfigService,
    AuthenticatedUserService,
    TokenService,
    RedisService,
    LoginRedisSession,
    CookieService,
    JwtAuthGuard,
    LocalAuthGuard,
  ],
})
export class CommonModule {}
