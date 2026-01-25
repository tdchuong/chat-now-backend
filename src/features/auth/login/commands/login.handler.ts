import { TokenService } from '@/common/token/token.service';
import { LoginRedisSession } from '@/common/redis/auth/login-redis.session';
import { hashStringSHA256 } from '@/common/utils';
import { hashFingerprint } from '@/common/utils/fingerprint.util';
import { PrismaService } from '@/database/prisma.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand } from 'src/features/auth/login/commands/login.command';
import { v4 as uuidv4 } from 'uuid';
import { AppConfigService } from '@/common/env/config.service';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    private prisma: PrismaService,
    private readonly tokenSerivce: TokenService,
    private readonly loginRedisSession: LoginRedisSession,
    private readonly configService: AppConfigService,
  ) {}
  async execute(command: LoginCommand): Promise<any> {
    const jwtConfig = this.configService.jwtConfig;
    const user = command.user;
    const device = await this.upsertUserDevice(command, user.id!);

    const now = Math.floor(Date.now() / 1000);
    const familyId = uuidv4();
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
        displayName: user.display_name,
      },
      device: {
        deviceId: device.id,
        name: device.device_name,
        isTrusted: command.rememberDevice ? true : device.is_trusted,
      },
      token: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    };
  }
  private async upsertUserDevice(command: LoginCommand, userId: string) {
    const hash = hashFingerprint(command.fingerprint);

    return await this.prisma.userDevice.upsert({
      where: {
        fingerprint_hash: hash,
      },
      update: {
        user_id: userId,
        ip_last: command.ip,
        user_agent: command.userAgent,
        last_seen: new Date(),
        last_active_at: new Date(),
        ...(command.rememberDevice && { is_trusted: true }),
      },
      create: {
        id: uuidv4(),
        fingerprint_hash: hash,
        user_id: userId,
        device_name: command.deviceInfo.deviceName,
        platform: command.fingerprint.platform,
        os: command.deviceInfo.os,
        os_version: command.deviceInfo.osVersion,
        browser: command.deviceInfo.browser,
        browser_version: command.deviceInfo.browserVersion,
        app_version: command.deviceInfo.appVersion,
        ip_first: command.ip,
        ip_last: command.ip,
        user_agent: command.userAgent,
        is_trusted: command.rememberDevice,
        first_seen: new Date(),
        last_seen: new Date(),
        last_active_at: new Date(),
      },
    });
  }
}
