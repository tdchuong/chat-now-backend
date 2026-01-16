import { AppConfigService } from '@/common/env/config.service';
import {
  DeviceBelongsToAnotherUserException,
  DeviceInactiveException,
  DeviceNotFoundException,
} from '@/common/exceptions/device.exception';
import { TokenInvalidException } from '@/common/exceptions/token.exception';
import { UserNotFoundException } from '@/common/exceptions/user.exception';
import { RTokenRedisSession } from '@/common/redis/auth/refresh-token-redis.session';
import { TokenService } from '@/common/token/token.service';
import { hashStringSHA256 } from '@/common/utils';
import { PrismaService } from '@/database/prisma.service';
import { RefreshTokenCommand } from '@/features/auth/refresh-token/commands/refresh-token.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(
    private readonly tokenService: TokenService,
    private readonly rTokenRedisSession: RTokenRedisSession,
    private readonly configService: AppConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<any> {
    const jwtConfig = this.configService.jwtConfig;

    const payload = await this.verifyRefreshToken(command.refreshToken);
    await this.verifyDevice(payload.deviceId, payload.userId);

    const now = Math.floor(Date.now() / 1000);
    const { accessToken, refreshToken, rtJti } =
      this.tokenService.generateTokenPair({
        userId: payload.userId,
        deviceId: payload.deviceId,
        familyId: payload.familyId,
      });

    await this.rTokenRedisSession.execute({
      userId: payload.userId,
      deviceId: payload.deviceId,
      jti: rtJti,
      familyId: payload.familyId,
      refreshTokenHash: hashStringSHA256(refreshToken),
      ttl: jwtConfig.refreshExpiresIn,
      now,
      maxDevices: 5,
      absoluteExpiry: now + jwtConfig.refreshTokenMaxLifetime,
    });

    // 6. Update device last seen
    await this.updateDeviceActivity(payload.deviceId, command.ip);

    // 7. Get user info
    const user = await this.getUserInfo(payload.userId);

    return {
      user: {
        id: user.id,
        displayName: user.display_name,
      },
      token: {
        accessToken,
        refreshToken,
      },
    };
  }

  /**
   * Verify and decode refresh token
   */
  private async verifyRefreshToken(refreshToken: string) {
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);

    if (!payload.userId || !payload.deviceId || !payload.familyId) {
      throw new TokenInvalidException('Refresh token payload invalid');
    }
    return payload;
  }

  /**
   * Verify device exists and belongs to the user
   */
  private async verifyDevice(deviceId: string, userId: string) {
    const device = await this.prisma.userDevice.findUnique({
      where: { id: deviceId },
      select: { user_id: true, last_active_at: true },
    });
    if (!device) throw new DeviceNotFoundException();

    if (device.user_id !== userId)
      throw new DeviceBelongsToAnotherUserException();

    if (!device.last_active_at) throw new DeviceInactiveException();
  }
  /**
   * Handle Redis script errors
   */

  /**
   * Update device last activity
   */
  private async updateDeviceActivity(deviceId: string, ip?: string) {
    await this.prisma.userDevice.update({
      where: { id: deviceId },
      data: {
        last_active_at: new Date(),
        last_seen: new Date(),
        ...(ip && { ip_last: ip }),
      },
    });
  }

  /**
   * Get user information
   */
  private async getUserInfo(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        display_name: true,
      },
    });

    if (!user) throw new UserNotFoundException();
    return user;
  }
}
