import { AppConfigService } from '@/common/env/config.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

type JwtPayloadBase = {
  sub: string;
};

export interface AccessTokenPayload extends JwtPayloadBase {
  jti: string;
  deviceId: string;
  role: string;
}

export interface RefreshTokenPayload extends JwtPayloadBase {
  jti: string;
  deviceId: string;
  familyId: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: AppConfigService,
  ) {}
  generateAccessToken(payload: AccessTokenPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.jwtConfig.accessExpiresIn,
    });
  }
  generateRefreshToken(payload: RefreshTokenPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.jwtConfig.refreshExpiresIn,
    });
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    return this.jwtService.verify(token);
  }

  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    return this.jwtService.verify(token);
  }
}
