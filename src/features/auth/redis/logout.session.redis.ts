import { AuthRedisKey } from '@/features/auth/redis/auth.redis-keys';
import { RedisService } from '@/common/redis/redis.service';
import { Injectable, Logger } from '@nestjs/common';

export interface LogoutCommandParams {
  userId: string;
  deviceId: string;
}

export interface LogoutResult {
  /** Số device còn lại sau khi logout */
  remainingDevices: number;
  /** true nếu device tồn tại và đã bị xóa, false nếu session không tồn tại */
  wasActive: boolean;
}


@Injectable()
export class LogoutRedisSession {
  private readonly logger = new Logger(LogoutRedisSession.name);

  /**
   * KEYS:
   *   [1] userDevicesKey   — auth:user:{userId}:devices
   *   [2] deviceTokenKey   — auth:device:{deviceId}:rt
   *   [3] deviceJtiKey     — auth:device:{deviceId}:jti
   *   [4] devicePrevJtiKey — auth:device:{deviceId}:prev_jti
   *
   * ARGV:
   *   [1] deviceId
   *
   * Returns: [remainingDevices, wasActive]
   *
   * Lưu ý:
   *   - KHÔNG xóa familyKey / familyExpiryKey vì logout ≠ token theft.
   *     Family chỉ cần xóa khi phát hiện reuse attack (xử lý ở RefreshValidate).
   *   - Xóa jti mapping (auth:jti:{jti}) để token cũ không thể dùng lại,
   *     dù access token vẫn còn hạn (stateless JWT — chấp nhận window nhỏ).
   */
  private readonly luaScript = `
    local userDevicesKey   = KEYS[1]
    local deviceTokenKey   = KEYS[2]
    local deviceJtiKey     = KEYS[3]
    local devicePrevJtiKey = KEYS[4]

    local deviceId = ARGV[1]

    -- Kiểm tra device có tồn tại không
    local existingScore = redis.call('ZSCORE', userDevicesKey, deviceId)
    if not existingScore then
      -- Session không tồn tại, idempotent return
      local remaining = redis.call('ZCARD', userDevicesKey)
      return {remaining, 0}
    end

    -- Lấy jti hiện tại và prev để xóa mapping
    local currentJti = redis.call('GET', deviceJtiKey)
    local prevJti    = redis.call('GET', devicePrevJtiKey)

    -- Xóa tất cả keys của device
    redis.call('DEL', deviceTokenKey, deviceJtiKey, devicePrevJtiKey)

    -- Xóa jti mapping để invalidate ngay lập tức
    if currentJti then
      redis.call('DEL', 'auth:jti:' .. currentJti)
    end
    if prevJti then
      redis.call('DEL', 'auth:jti:' .. prevJti)
    end

    -- Xóa device khỏi sorted set
    redis.call('ZREM', userDevicesKey, deviceId)

    local remaining = redis.call('ZCARD', userDevicesKey)
    return {remaining, 1}
  `;

  constructor(private readonly redisService: RedisService) {}

  async execute(params: LogoutCommandParams): Promise<LogoutResult> {
    this.logger.log(
      `🚪 Logging out: userId=${params.userId}, deviceId=${params.deviceId}`,
    );

    const keys = this.buildKeys(params);
    const args = this.buildArgs(params);

    const sha = await this.redisService.loadScript(this.luaScript);
    const result = await this.redisService.executeScriptBySha(
      sha,
      keys,
      args,
      this.luaScript,
    );

    const logoutResult: LogoutResult = {
      remainingDevices: result[0],
      wasActive: result[1] === 1,
    };

    if (!logoutResult.wasActive) {
      this.logger.warn(
        `⚠️  Logout called but session not found: userId=${params.userId}, deviceId=${params.deviceId}`,
      );
    } else {
      this.logger.log(
        `✅ Logout success: userId=${params.userId}, remainingDevices=${logoutResult.remainingDevices}`,
      );
    }

    return logoutResult;
  }

  private buildKeys(params: LogoutCommandParams): string[] {
    return [
      AuthRedisKey.userDevices(params.userId),      // KEYS[1]
      AuthRedisKey.deviceToken(params.deviceId),    // KEYS[2]
      AuthRedisKey.deviceJti(params.deviceId),      // KEYS[3]
      AuthRedisKey.devicePrevJti(params.deviceId),  // KEYS[4]
    ];
  }

  private buildArgs(params: LogoutCommandParams): (string | number)[] {
    return [
      params.deviceId, // ARGV[1]
    ];
  }
}