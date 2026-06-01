import { LoginRedisSession } from '@/features/auth/redis/login-redis.session.redis';
import { TokenService } from '@/features/auth/services/token.service';
import { hashFingerprint, hashStringSHA256 } from '@/common/utils';

import { AppConfigService } from '@/common/env/config.service';
import { PrismaService } from '@/database/prisma.service';
import { LoginReqDto } from '@/features/auth/use-cases/login/dto/login.req.dto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User, UserDevice } from 'generated/prisma/client';
import { ulid } from 'ulid';
import { UserService } from '@/features/users/user.service';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
    private readonly loginRedisSession: LoginRedisSession,
    private readonly configService: AppConfigService,
  ) {}
  async execute(dto: LoginReqDto, metadata: { ip: string; userAgent: string }) {
    const user = await this.userService.validateUserCredentials(
      dto.username,
      dto.password,
    );
    if (!user.id) throw new InternalServerErrorException('User id missing');
    const userId = user.id;

    const device = await this.upsertUserDevice(
      dto,
      userId,
      metadata.ip,
      metadata.userAgent,
    );

    const jwtConfig = this.configService.jwtConfig;
    const accessToken = this.tokenService.generateAccessToken({
      sub: userId,
      deviceId: device.id,
      jti: ulid(),
      role: user.role,
    });

    const rtJti = ulid();
    const familyId = ulid();
    const refreshToken = this.tokenService.generateRefreshToken({
      sub: userId,
      deviceId: device.id,
      jti: rtJti,
      familyId,
    });

    await this.loginRedisSession.execute({
      userId: userId,
      deviceId: device.id,
      refreshTokenHash: hashStringSHA256(refreshToken),
      familyId,
      jti: rtJti,
      maxDevices: 4,
      now: Math.floor(Date.now() / 1000),
      ttl: jwtConfig.refreshExpiresIn,
      absoluteExpiry: jwtConfig.refreshTokenMaxLifetime,
    });

    return {
      user: {
        userId,
        displayName: user.displayName,
      },
      token: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    };
  }

  private upsertUserDevice(
    dto: LoginReqDto,
    userId: string,
    ip: string,
    userAgent: string,
  ): Promise<UserDevice> {
    const hash = hashFingerprint(dto.fingerprint.visitorId);
    return this.prisma.userDevice.upsert({
      where: {
        fingerprintHash: hash,
        userId,
      },
      update: {
        ipLast: ip,
        userAgent,
        deviceName: dto.deviceInfo.deviceName,
        os: dto.deviceInfo.os,
        osVersion: dto.deviceInfo.osVersion,
        browser: dto.deviceInfo.browser,
        browserVersion: dto.deviceInfo.browserVersion,
        platform: dto.deviceInfo.platform,
      },
      create: {
        id: ulid(),
        userId,
        deviceName: dto.deviceInfo.deviceName,
        os: dto.deviceInfo.os,
        osVersion: dto.deviceInfo.osVersion,
        fingerprintHash: hash,
        browser: dto.deviceInfo.browser,
        browserVersion: dto.deviceInfo.browserVersion,
        ipLast: ip,
        platform: dto.deviceInfo.platform,
        userAgent,
      },
    });
  }
}
