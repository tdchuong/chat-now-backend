import { AppConfigService } from '@/common/env/config.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export interface AccessTokenPayload {
  userId: string;
  deviceId: string;
  jti: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  userId: string;
  deviceId: string;
  jti: string;
  familyId: string;
  type: 'refresh';
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: AppConfigService,
  ) {}

  generateTokenPair({ userId, deviceId, familyId }): {
    accessToken: string;
    refreshToken: string;
    rtJti: string;
  } {
    const accessToken = this.generateAccessToken(userId, deviceId);
    const { rtJti, refreshToken } = this.generateRefreshToken(
      userId,
      deviceId,
      familyId,
    );

    return { accessToken, refreshToken, rtJti };
  }

  generateAccessToken(userId: string, deviceId: string): string {
    const jti = this.generateJti();
    const payload: AccessTokenPayload = {
      userId,
      deviceId,
      jti,
      type: 'access',
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.configService.jwtConfig.accessExpiresIn,
    });
  }

  generateRefreshToken(
    userId: string,
    deviceId: string,
    familyId: string,
  ): { rtJti: string; refreshToken: string } {
    const jti = this.generateJti();
    const payload: RefreshTokenPayload = {
      userId,
      deviceId,
      jti,
      familyId,
      type: 'refresh',
    };

    return {
      rtJti: jti,
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: this.configService.jwtConfig.refreshExpiresIn,
      }),
    };
  }

  generateJti(): string {
    return uuidv4();
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    return this.jwtService.verify(token);
  }

  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    return this.jwtService.verify(token);
  }
}
