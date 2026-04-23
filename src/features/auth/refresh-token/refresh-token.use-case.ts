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
import { RefreshTokenReqDto } from '@/features/auth/refresh-token/dto/refresh-token.req.dto';

export class RefreshTokenUseCase {
  constructor(
    private readonly tokenService: TokenService,
    private readonly rTokenRedisSession: RTokenRedisSession,
    private readonly configService: AppConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(dto: RefreshTokenReqDto) {
    const jwtConfig = this.configService.jwtConfig;

    const payload = await this.verifyRefreshToken(dto.refreshToken);
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
    await this.updateDeviceActivity(payload.deviceId, dto.ip);

    // 7. Get user info
    const user = await this.getUserInfo(payload.userId);

    return {
      user: {
        id: user.id,
        displayName: user.displayName,
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
      select: { userId: true, lastActiveAt: true },
    });
    if (!device) throw new DeviceNotFoundException();

    if (device.userId !== userId)
      throw new DeviceBelongsToAnotherUserException();

    if (!device.lastActiveAt) throw new DeviceInactiveException();
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
        lastActiveAt: new Date(),
        lastSeen: new Date(),
        ...(ip && { ipLast: ip }),
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
        displayName: true,
      },
    });

    if (!user) throw new UserNotFoundException();
    return user;
  }
}
