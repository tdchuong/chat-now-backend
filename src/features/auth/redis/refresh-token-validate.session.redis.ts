import { ERROR_CODE, ErrorCode } from '@/common/constants/error-codes';
import { AuthRedisKey } from '@/features/auth/redis/auth.redis-keys';
import { RedisService } from '@/common/redis/redis.service';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';

// ─── Params & Result ───────────────────────────────────────────────────────

export interface ValidateRefreshParams {
  userId: string;
  deviceId: string;
  /** JTI của token cũ — lấy từ payload.jti khi verify */
  prevJti: string;
  familyId: string;
  now: number;
}
// REDIS
// │
// └── auth
//     │
//     ├── device
//     │   │
//     │   ├── d1
//     │   │   │
//     │   │   ├── auth:device:d1:jti
//     │   │   │      = jti-2
//     │   │   │
//     │   │   ├── auth:device:d1:rt
//     │   │   │      = refresh-token
//     │   │   │
//     │   │   └── auth:device:d1:prev_jti
//     │   │          = jti-1
//     │   │
//     │
//     ├── family
//     │   │
//     │   ├── fam-001
//     │   │   │
//     │   │   ├── auth:family:fam-001
//     │   │   │      = {
//     │   │   │          jti-1,
//     │   │   │          jti-2,
//     │   │   │          jti-3
//     │   │   │        }
//     │   │   │
//     │   │   └── auth:family:fam-001:absolute_expiry
//     │   │          = 1750000000
//     │   │
//     ├── jti
//     │   │
//     │   ├── auth:jti:jti-1
//     │   │      = d1
//     │   │
//     │   ├── auth:jti:jti-2
//     │   │      = d1
//     │   │
//     │   ├── auth:jti:jti-3
//     │   │      = d1
//     │   │
//     │   ├── auth:jti:jti-8
//     │   │      = d2
//     │   │
//     │   └── auth:jti:jti-9
//     │          = d2
//     │
//     │
//     └── user
//         │
//         ├── u1
//         │   │
//         │   └── auth:user:u1:devices
//         │          = [ d1, d2 ]
//         │
//         └── u2
//             │
//             └── auth:user:u2:devices
//                    = [ d7 ]

export interface ValidateRefreshResult {
  /**
   * Số giây còn lại của phiên (absoluteExpiry - now).
   * Phase 2 dùng để set TTL đúng — đảm bảo không vượt quá absoluteExpiry.
   */
  remainingTtl: number;
  /**
   * Số device đang active của user tại thời điểm validate.
   * Phase 2 / UseCase dùng để enforce giới hạn thiết bị nếu cần.
   */
  deviceCount: number;
  /**
   * Số JTI đang tồn tại trong family.
   * Dùng để log hoặc audit rotation history.
   */
  familySize: number;
}

// ─── Service ───────────────────────────────────────────────────────────────

@Injectable()
export class RTokenValidateSession {
  private readonly logger = new Logger(RTokenValidateSession.name);

  /**
   * KEYS:
   *   [1] userDevicesKey  — auth:user:{userId}:devices
   *   [2] deviceJtiKey    — auth:device:{deviceId}:jti
   *   [3] familyKey       — auth:family:{familyId}
   *   [4] familyExpiryKey — auth:family:{familyId}:expiry
   *
   * ARGV:
   *   [1] deviceId
   *   [2] prevJti
   *   [3] now
   *   [4] familyId
   *
   * Returns: [status, remainingTtl, deviceCount, familySize]
   *   status  1 = OK
   *          -1 = REUSE_DETECTED
   *          -2 = PREV_JTI_REQUIRED
   *          -3 = TOKEN_EXPIRED_OR_INVALID
   *          -4 = DEVICE_MISMATCH
   *          -5 = TOKEN_NOT_IN_FAMILY
   *          -6 = FAMILY_NOT_FOUND
   *          -7 = ABSOLUTE_EXPIRY_EXCEEDED
   */
  private readonly script = `
    local userDevicesKey  = KEYS[1]
    local deviceJtiKey    = KEYS[2]
    local familyKey       = KEYS[3]
    local familyExpiryKey = KEYS[4]

    local deviceId = ARGV[1]
    local prevJti  = ARGV[2]
    local now      = tonumber(ARGV[3])
    local familyId = ARGV[4]

    -- Helper: xóa toàn bộ family khi phát hiện reuse
    local function invalidateFamily(fid)

      --auth:family:fam-001
      local familySetKey = 'auth:family:' .. fid

      --auth:family:fam-001:expiry
      local familyExpKey = 'auth:family:' .. fid .. ':expiry'

      -- Lấy toàn bộ jti của token dựa vào familyId
      local members      = redis.call('SMEMBERS', familySetKey)

      --④ Loop từng JTI
      for _, memberJti in ipairs(members) do

        -- Lấy deviceId từ JTI
        local memberDeviceId = redis.call('GET', 'auth:jti:' .. memberJti)

        if memberDeviceId then

          local oldTokenKey   = 'auth:device:' .. memberDeviceId .. ':rt'
          local oldJtiKey     = 'auth:device:' .. memberDeviceId .. ':jti'
          local oldPrevJtiKey = 'auth:device:' .. memberDeviceId .. ':prev_jti'

          local oldJti        = redis.call('GET', oldJtiKey)
          local oldPrevJti    = redis.call('GET', oldPrevJtiKey)

          -- xóa auth.device:{deviceId}:rt 
          -- auth.device:{deviceId}:jti 
          -- auth.device:{deviceId}:prev_jti
          redis.call('DEL', oldTokenKey, oldJtiKey, oldPrevJtiKey)

          if oldJti     then redis.call('DEL', 'auth:jti:' .. oldJti)     end
          if oldPrevJti then redis.call('DEL', 'auth:jti:' .. oldPrevJti) end

          redis.call('ZREM', userDevicesKey, memberDeviceId)
        end
        redis.call('DEL', 'auth:jti:' .. memberJti)
      end

      redis.call('DEL', familySetKey, familyExpKey)
    end

    -- ① Kiểm tra absoluteExpiry — set cố định lúc login, không bao giờ thay đổi
    local absoluteExpiry = redis.call('GET', familyExpiryKey)
    
    if not absoluteExpiry then
      return {-6, 0, 0, 0}  -- FAMILY_NOT_FOUND
    end
    local absExp = tonumber(absoluteExpiry)
    if absExp < now then
      invalidateFamily(familyId)
      return {-7, 0, 0, 0}  -- ABSOLUTE_EXPIRY_EXCEEDED
    end

    -- ② prevJti chính id của refresh token mà client cung cấp 
    -- (client gửi lên)
    if not prevJti or prevJti == '' then
      return {-2, 0, 0, 0}  -- PREV_JTI_REQUIRED
    end

    -- ③ prevJti phải map về đúng deviceId
    local storedDeviceId = redis.call('GET', 'auth:jti:' .. prevJti)
    if not storedDeviceId then
      return {-3, 0, 0, 0}  -- TOKEN_EXPIRED_OR_INVALID
    end
    if storedDeviceId ~= deviceId then
      return {-4, 0, 0, 0}  -- DEVICE_MISMATCH
    end

    -- ④ Reuse detection: prevJti phải là JTI đang active của device
    local currentJti = redis.call('GET', deviceJtiKey)
    if currentJti ~= prevJti then
      invalidateFamily(familyId)
      return {-1, 0, 0, 0}  -- REUSE_DETECTED
    end

    -- ⑤ prevJti phải nằm trong family
    if redis.call('SISMEMBER', familyKey, prevJti) == 0 then
      return {-5, 0, 0, 0}  -- TOKEN_NOT_IN_FAMILY
    end

    -- OK — trả về đủ thông tin để phase 2 dùng
    local remainingTtl = absExp - now
    local deviceCount  = redis.call('ZCARD', userDevicesKey)
    local familySize   = redis.call('SCARD', familyKey)
    return {1, remainingTtl, deviceCount, familySize}
  `;

  constructor(private readonly redisService: RedisService) {}

  /**
   * Validate refresh token — CHỈ ĐỌC, không ghi gì vào Redis.
   * @returns ValidateRefreshResult để truyền sang RTokenCommitSession
   * @throws UnauthorizedException nếu token không hợp lệ
   */
  async execute(params: ValidateRefreshParams): Promise<ValidateRefreshResult> {
    const keys = [
      AuthRedisKey.userDevices(params.userId), // KEYS[1]
      AuthRedisKey.deviceJti(params.deviceId), // KEYS[2]
      AuthRedisKey.tokenFamily(params.familyId), // KEYS[3]
      AuthRedisKey.familyExpiry(params.familyId), // KEYS[4]
    ];
    const args: (string | number)[] = [
      params.deviceId, // ARGV[1]
      params.prevJti, // ARGV[2]
      params.now, // ARGV[3]
      params.familyId, // ARGV[4]
    ];

    const sha = await this.redisService.loadScript(this.script);
    const [status, remainingTtl, deviceCount, familySize] =
      await this.redisService.executeScriptBySha(sha, keys, args, this.script);

    if (status !== 1) {
      this.logger.warn(
        `🚨 Validate rejected (status=${status}): ` +
          `prevJti=${params.prevJti}, ` +
          `userId=${params.userId}, deviceId=${params.deviceId}, ` +
          `familyId=${params.familyId}`,
      );
      throw new UnauthorizedException(
        RTokenValidateSession.getErrorMessage(status),
      );
    }

    return { remainingTtl, deviceCount, familySize };
  }

  static getErrorMessage(status: number): {
    errorCode: ErrorCode;
    message: string;
  } {
    const errorMap: Record<number, { errorCode: ErrorCode; message: string }> =
      {
        [-1]: {
          errorCode: ERROR_CODE.REDIS_AUTH_REUSE_DETECTED,
          message: 'Reuse detected — all sessions invalidated',
        },
        [-2]: {
          errorCode: ERROR_CODE.REDIS_AUTH_PREV_JTI_REQUIRED,
          message: 'Previous JTI is required',
        },
        [-3]: {
          errorCode: ERROR_CODE.REDIS_AUTH_TOKEN_EXPIRED,
          message: 'Token is expired or invalid',
        },
        [-4]: {
          errorCode: ERROR_CODE.REDIS_AUTH_DEVICE_MISMATCH,
          message: 'Token belongs to a different device',
        },
        [-5]: {
          errorCode: ERROR_CODE.REDIS_AUTH_TOKEN_NOT_IN_FAMILY,
          message: 'Token not in family',
        },
        [-6]: {
          errorCode: ERROR_CODE.REDIS_AUTH_FAMILY_NOT_FOUND,
          message: 'Session family not found',
        },
        [-7]: {
          errorCode: ERROR_CODE.REDIS_AUTH_ABSOLUTE_EXPIRY_EXCEEDED,
          message: 'Maximum session lifetime exceeded',
        },
      };

    return (
      errorMap[status] ?? {
        errorCode: ERROR_CODE.REDIS_AUTH_REUSE_DETECTED,
        message: 'Unknown Redis auth error',
      }
    );
  }
}
