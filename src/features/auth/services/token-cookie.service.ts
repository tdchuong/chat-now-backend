import { AppConfigService } from '@/common/env/config.service';
import { Injectable } from '@nestjs/common';
import { Response } from 'express';

interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  maxAge: number;
  path: string;
}

@Injectable()
export class TokenCookieService {
  constructor(private readonly configService: AppConfigService) {}
  private readonly cookieOptions = (maxAge: number): CookieOptions => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', //Vì production nên dùng HTTPS.
    sameSite: 'lax',
    maxAge,
    path: '/',
  });

  setAccessToken(res: Response, token: string) {
    res.cookie(
      'access_token',
      token,
      this.cookieOptions(this.configService.jwtConfig.accessExpiresIn * 1000),
    );
  }

  setRefreshToken(res: Response, token: string) {
    res.cookie(
      'refresh_token',
      token,
      this.cookieOptions(this.configService.jwtConfig.refreshExpiresIn * 1000),
    );
  }

  clearTokens(res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
  }
}
