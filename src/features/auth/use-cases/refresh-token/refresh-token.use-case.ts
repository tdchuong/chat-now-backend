import {
  DeviceBelongsToAnotherUserException,
  DeviceNotFoundException,
} from '@/common/exceptions/device.exception';
import { TokenInvalidException } from '@/common/exceptions/token.exception';
import { UserNotFoundException } from '@/common/exceptions/user.exception';
import { hashStringSHA256 } from '@/common/utils';
import { PrismaService } from '@/database/prisma.service';
import { RTokenValidateSession } from '@/features/auth/redis/refresh-token-validate.session.redis';
import { RTokenCommitSession } from '@/features/auth/redis/rtoken-commit.session.redis';
import { TokenService } from '@/features/auth/services/token.service';
import { Injectable } from '@nestjs/common';
import { ulid } from 'ulid';

export interface RefreshTokenResult {
  token: {
    accessToken: string;
    refreshToken: string;
  };
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly tokenService: TokenService,
    private readonly rTokenValidateSession: RTokenValidateSession,
    private readonly rTokenCommitSession: RTokenCommitSession,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    oldRefreshToken: string,
    ip: string,
  ): Promise<RefreshTokenResult> {
    const now = Math.floor(Date.now() / 1000);
    console.log('Executing RefreshTokenUseCase with IP:', ip);

    // 1. Verify và decode refresh token cũ
    const payload = await this.verifyRefreshToken(oldRefreshToken);

    // 2. Kiểm tra device trong DB
    await this.verifyDevice(payload.deviceId, payload.sub);

    // 3. Phase 1 — Validate Redis (chỉ đọc, không ghi)
    //    Trả về { remainingTtl, deviceCount, familySize }
    //    → throw ngay nếu reuse / expired / mismatch, token chưa được tạo
    const validateResult = await this.rTokenValidateSession.execute({
      userId: payload.sub,
      deviceId: payload.deviceId,
      prevJti: payload.jti,
      familyId: payload.familyId,
      now,
    });

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        role: true,
      },
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    // 4. Generate token mới — chỉ chạy khi phase 1 pass
    const rtJti = ulid();
    const accessToken = this.tokenService.generateAccessToken({
      sub: payload.sub,
      deviceId: payload.deviceId,
      jti: ulid(),
      role: user.role,
    });
    const refreshToken = this.tokenService.generateRefreshToken({
      sub: payload.sub,
      deviceId: payload.deviceId,
      jti: rtJti,
      familyId: payload.familyId,
    });

    // 5. Phase 2 — Commit rotation vào Redis
    //    validateResult truyền thẳng vào — commit dùng:
    //      • remainingTtl  → set TTL đúng, không vượt absoluteExpiry
    //      • deviceCount   → log audit
    //      • familySize    → log audit
    await this.rTokenCommitSession.execute({
      userId: payload.sub,
      deviceId: payload.deviceId,
      newJti: rtJti,
      prevJti: payload.jti,
      familyId: payload.familyId,
      refreshTokenHash: hashStringSHA256(refreshToken),
      now,
      validateResult, // ← truyền nguyên vẹn, không destructure
    });

    // 6. Update device last seen
    await this.updateDeviceActivity(payload.deviceId, ip);

    return {
      token: { accessToken, refreshToken },
    };
  }

  private async verifyRefreshToken(refreshToken: string) {
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);

    if (
      !payload.sub ||
      !payload.deviceId ||
      !payload.familyId ||
      !payload.jti
    ) {
      throw new TokenInvalidException();
    }

    return payload;
  }

  private async verifyDevice(deviceId: string, userId: string): Promise<void> {
    const device = await this.prisma.userDevice.findUnique({
      where: { id: deviceId },
      select: { userId: true, isTrusted: true },
    });

    if (!device) throw new DeviceNotFoundException();
    if (device.userId !== userId)
      throw new DeviceBelongsToAnotherUserException();
  }

  private async updateDeviceActivity(
    deviceId: string,
    ip?: string,
  ): Promise<void> {
    await this.prisma.userDevice.update({
      where: { id: deviceId },
      data: {
        lastActiveAt: new Date(),
        ...(ip && { ipLast: ip }),
      },
    });
  }
}
