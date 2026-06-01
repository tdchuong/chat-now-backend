import { AuthController } from '@/features/auth/auth.controller';
import { AuthRefreshGuard } from '@/features/auth/guards/jwt-auth.guard';
import { LocalAuthGuard } from '@/features/auth/guards/local-auth.guard';
import { LogoutRedisSession } from '@/features/auth/redis/logout.session.redis';
import { RTokenValidateSession } from '@/features/auth/redis/refresh-token-validate.session.redis';
import { RTokenCommitSession } from '@/features/auth/redis/rtoken-commit.session.redis';
import { JwtStrategy } from '@/features/auth/strategies/jwt.strategy';
import { LocalStrategy } from '@/features/auth/strategies/local.strategy';
import { GetMeUseCase } from '@/features/auth/use-cases/get-me/get-me.use-case';
import { LoginUseCase } from '@/features/auth/use-cases/login/login.use-case';
import { LogoutUseCase } from '@/features/auth/use-cases/logout/logout-use-case';
import { RefreshTokenUseCase } from '@/features/auth/use-cases/refresh-token/refresh-token.use-case';
import { RegisterUseCase } from '@/features/auth/use-cases/register/register.use-case';
import { UserDeviceModule } from '@/features/user-device/user-device.module';
import { UserModule } from '@/features/users/user.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [UserDeviceModule, UserModule],
  providers: [
    LoginUseCase,
    RegisterUseCase,
    RefreshTokenUseCase,
    GetMeUseCase,
    LogoutUseCase,

    JwtStrategy,
    LocalStrategy,

    AuthRefreshGuard,
    LocalAuthGuard,

    RTokenValidateSession,
    RTokenCommitSession,
    LogoutRedisSession,
  ],
  controllers: [AuthController],
  exports: [JwtStrategy, LocalStrategy, AuthRefreshGuard, LocalAuthGuard],
})
export class AuthModule {}
