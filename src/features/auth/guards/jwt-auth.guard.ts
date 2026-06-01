import { AuthUnauthorizedException } from '@/common/exceptions/auth.exception';
import { TokenCookieService } from '@/features/auth/services/token-cookie.service';
import {
  AccessTokenPayload,
  TokenService,
} from '@/features/auth/services/token.service';
import { RefreshTokenUseCase } from '@/features/auth/use-cases/refresh-token/refresh-token.use-case';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';

export interface AuthRequest extends Request {
  user: AccessTokenPayload;
}

@Injectable()
export class AuthRefreshGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly tokenCookieService: TokenCookieService,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthRequest>();

    const res = context.switchToHttp().getResponse<Response>();

    const { access_token: accessToken, refresh_token: refreshToken } =
      req.cookies ?? {};
    console.log('Cookies1:', {
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (!accessToken && !refreshToken) {
      throw new AuthUnauthorizedException();
    }

    if (accessToken) {
      try {
        req.user = await this.tokenService.verifyAccessToken(accessToken);
        return true;
      } catch {}
    }

    if (!refreshToken) {
      throw new AuthUnauthorizedException();
    }
    return this.handleRefresh(req, res, refreshToken);
  }

  private async handleRefresh(
    req: Request,
    res: Response,
    refreshToken: string,
  ): Promise<any> {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress ||
      '';
    const result = await this.refreshTokenUseCase.execute(
      refreshToken,
      ip.trim(),
    );

    this.tokenCookieService.setAccessToken(res, result.token.accessToken);
    if (result.token.refreshToken) {
      this.tokenCookieService.setRefreshToken(res, result.token.refreshToken);
    }

    req.user = await this.tokenService.verifyAccessToken(
      result.token.accessToken,
    );
    return true;
  }
}
