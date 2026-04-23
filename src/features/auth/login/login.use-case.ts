import { TokenService } from '@/common/token/token.service';
import { LoginRedisSession } from '@/common/redis/auth/login-redis.session';
import { generateId, hashFingerprint, hashStringSHA256 } from '@/common/utils';

import { AppConfigService } from '@/common/env/config.service';
import { Injectable } from '@nestjs/common';
import { LoginReqDto } from '@/features/auth/login/dto/login.req.dto';
import { User } from 'generated/prisma/client';
import { UserDeviceRepository } from '@/database/repositories/user-device.repository';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userDeviceRepository: UserDeviceRepository,
    private readonly tokenSerivce: TokenService,
    private readonly loginRedisSession: LoginRedisSession,
    private readonly configService: AppConfigService,
  ) {}
  async execute(dto: LoginReqDto, user: User){
    const device = await this.upsertUserDevice(dto, user.id!);

    const jwtConfig = this.configService.jwtConfig;
    const now = Math.floor(Date.now() / 1000);
    const familyId = generateId();

    const { accessToken, refreshToken, rtJti } =
      this.tokenSerivce.generateTokenPair({
        userId: user.id!,
        deviceId: device.id,
        familyId,
      });

    await this.loginRedisSession.execute({
      userId: user.id!,
      deviceId: device.id,
      refreshTokenHash: hashStringSHA256(refreshToken),
      familyId,
      jti: rtJti,
      maxDevices: 5,
      now,
      ttl: jwtConfig.refreshExpiresIn,
      absoluteExpiry: jwtConfig.refreshTokenMaxLifetime,
    });

    return {
      user: {
        id: user.id,
        displayName: user.displayName,
      },
      device: {
        deviceId: device.id,
        name: device.deviceName,
        isTrusted: dto.rememberDevice ? true : device.isTrusted,
      },
      token: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    };
  }
  private async upsertUserDevice(command: LoginReqDto, userId: string) {
    const hash = hashFingerprint(command.fingerprint);

    return await this.userDeviceRepository.upsert({
      where: {
        fingerprintHash: hash,
      },
      update: {
        userId,
        ipLast: command.ip,
        userAgent: command.userAgent,
        lastSeen: new Date(),
        lastActiveAt: new Date(),
        ...(command.rememberDevice && { isTrusted: true }),
      },
      create: {
        id: generateId(),
        fingerprintHash: hash,
        userId: userId,
        deviceName: command.deviceInfo.deviceName,
        platform: command.fingerprint.platform,
        os: command.deviceInfo.os,
        osVersion: command.deviceInfo.osVersion,
        browser: command.deviceInfo.browser,
        browserVersion: command.deviceInfo.browserVersion,
        appVersion: command.deviceInfo.appVersion,
        ipFirst: command.ip,
        ipLast: command.ip,
        userAgent: command.userAgent,
        isTrusted: command.rememberDevice,
        firstSeen: new Date(),
        lastSeen: new Date(),
        lastActiveAt: new Date(),
      },
    });
  }
}
