import { TokenInvalidException } from '@/common/exceptions/token.exception';
import { LogoutRedisSession } from '@/features/auth/redis/logout.session.redis';
import { TokenService } from '@/features/auth/services/token.service';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';

export interface LogoutUseCaseParams {
  refreshToken: string;
}
@Injectable()
export class LogoutUseCase {
  private readonly logger = new Logger(LogoutUseCase.name);
  constructor(
    private readonly tokenService: TokenService,
    private readonly logoutRedisSession: LogoutRedisSession,
  ) {}
  async execute(params: LogoutUseCaseParams) {
    const { refreshToken } = params;

    const {
      sub: userId,
      deviceId,
      familyId,
      jti,
    } = await this.tokenService.verifyRefreshToken(refreshToken);

    if (!userId || !deviceId || !familyId || !jti) {
      throw new TokenInvalidException();
    }

    const result = await this.logoutRedisSession.execute({ userId, deviceId });

    this.logger.log(
      `✅ Logout: userId=${userId}, deviceId=${deviceId}, ` +
        `remainingDevices=${result.remainingDevices}`,
    );
  }
}
