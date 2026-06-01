import { AuthRedisKey } from '@/features/auth/redis/auth.redis-keys';
import { RedisService } from '@/common/redis/redis.service';
import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ValidateRefreshResult } from '@/features/auth/redis/refresh-token-validate.session.redis';

// ─── Params ────────────────────────────────────────────────────────────────

export interface CommitRefreshParams {
  userId: string;
  deviceId: string;
  /** JTI mới — của refresh token vừa generate */
  newJti: string;
  /** JTI cũ — cùng giá trị đã dùng ở phase 1 */
  prevJti: string;
  familyId: string;
  refreshTokenHash: string;
  now: number;
  /** Kết quả nguyên vẹn từ ValidateRefreshResult — truyền thẳng, không tính lại */
  validateResult: ValidateRefreshResult;
}

// ─── Service ───────────────────────────────────────────────────────────────

@Injectable()
export class RTokenCommitSession {
  private readonly logger = new Logger(RTokenCommitSession.name);

  /**
   * KEYS:
   *   [1] userDevicesKey   — auth:user:{userId}:devices
   *   [2] deviceTokenKey   — auth:device:{deviceId}:rt
   *   [3] jtiMappingKey    — auth:jti:{newJti}
   *   [4] deviceJtiKey     — auth:device:{deviceId}:jti
   *   [5] devicePrevJtiKey — auth:device:{deviceId}:prev_jti
   *   [6] familyKey        — auth:family:{familyId}
   *   [7] familyExpiryKey  — auth:family:{familyId}:expiry
   *
   * ARGV:
   *   [1] deviceId
   *   [2] newJti
   *   [3] prevJti
   *   [4] refreshTokenHash
   *   [5] remainingTtl  ← từ ValidateRefreshResult, đảm bảo không vượt absoluteExpiry
   *   [6] now
   *
   * Returns: [1] nếu thành công
   */
  private readonly script = `
    local userDevicesKey   = KEYS[1]
    local deviceTokenKey   = KEYS[2]
    local jtiMappingKey    = KEYS[3]
    local deviceJtiKey     = KEYS[4]
    local devicePrevJtiKey = KEYS[5]
    local familyKey        = KEYS[6]
    local familyExpiryKey  = KEYS[7]

    local deviceId         = ARGV[1]
    local newJti           = ARGV[2]
    local prevJti          = ARGV[3]
    local refreshTokenHash = ARGV[4]
    local remainingTtl     = tonumber(ARGV[5])
    local now              = tonumber(ARGV[6])

    -- ① Rotate: lưu prevJti vào prev_jti slot, xóa mapping cũ
    redis.call('SET', devicePrevJtiKey, prevJti, 'EX', remainingTtl)
    redis.call('DEL', 'auth:jti:' .. prevJti)

    -- ② Cập nhật timestamp device trong sorted set
    redis.call('ZADD', userDevicesKey, now, deviceId)
    redis.call('EXPIRE', userDevicesKey, remainingTtl)

    -- ③ Lưu refresh token hash mới
    redis.call('SET', deviceTokenKey, refreshTokenHash, 'EX', remainingTtl)

    -- ④ Lưu mapping newJti → deviceId
    redis.call('SET', jtiMappingKey, deviceId, 'EX', remainingTtl)

    -- ⑤ Cập nhật JTI active của device
    redis.call('SET', deviceJtiKey, newJti, 'EX', remainingTtl)

    -- ⑥ Thêm newJti vào family set
    redis.call('SADD', familyKey, newJti)
    redis.call('EXPIRE', familyKey, remainingTtl)

    -- ⑦ Gia hạn TTL của familyExpiryKey = remainingTtl
    -- Giá trị KHÔNG thay đổi, chỉ đảm bảo key không bị Redis xóa trước absoluteExpiry
    redis.call('EXPIRE', familyExpiryKey, remainingTtl)

    return {1}
  `;

  constructor(private readonly redisService: RedisService) {}

  /**
   * Commit token rotation vào Redis.
   * Gọi SAU khi phase 1 pass và đã generate + hash token mới.
   *
   * @throws InternalServerErrorException nếu commit thất bại (lỗi infrastructure)
   */
  async execute(params: CommitRefreshParams): Promise<void> {
    const { remainingTtl, deviceCount, familySize } = params.validateResult;

    // Log trước khi commit — dùng deviceCount/familySize từ phase 1 để audit
    this.logger.log(
      `🔄 Committing token rotation: userId=${params.userId}, ` +
        `deviceId=${params.deviceId}, activeDevices=${deviceCount}, ` +
        `familySize=${familySize}, remainingTtl=${remainingTtl}s`,
    );

    const keys = [
      AuthRedisKey.userDevices(params.userId), // KEYS[1]
      AuthRedisKey.deviceToken(params.deviceId), // KEYS[2]
      AuthRedisKey.jtiMapping(params.newJti), // KEYS[3]
      AuthRedisKey.deviceJti(params.deviceId), // KEYS[4]
      AuthRedisKey.devicePrevJti(params.deviceId), // KEYS[5]
      AuthRedisKey.tokenFamily(params.familyId), // KEYS[6]
      AuthRedisKey.familyExpiry(params.familyId), // KEYS[7]
    ];
    const args: (string | number)[] = [
      params.deviceId, // ARGV[1]
      params.newJti, // ARGV[2]
      params.prevJti, // ARGV[3]
      params.refreshTokenHash, // ARGV[4]
      remainingTtl, // ARGV[5] ← từ phase 1
      params.now, // ARGV[6]
    ];

    const sha = await this.redisService.loadScript(this.script);
    const [status] = await this.redisService.executeScriptBySha(
      sha,
      keys,
      args,
      this.script,
    );

    if (status !== 1) {
      // Commit fail sau khi validate pass — lỗi infrastructure, cần alert ngay
      // Token đã generate nhưng không lưu được → client bị reject lần tiếp theo
      this.logger.error(
        `❌ Commit failed (status=${status}): ` +
          `userId=${params.userId}, deviceId=${params.deviceId}, ` +
          `familyId=${params.familyId}`,
      );
      throw new InternalServerErrorException('Failed to commit token rotation');
    }
  }
}
