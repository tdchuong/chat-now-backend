import { ERROR_CODE, ErrorCode } from '@/common/constants/error-codes';
import { AuthRedisKey } from '@/common/redis/auth/auth.redis-keys';
import { RedisService } from '@/common/redis/redis.service';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';

export interface LoginCommandParams {
  userId: string;
  deviceId: string;
  jti: string;
  familyId: string;
  refreshTokenHash: string;
  ttl: number;
  now: number;
  maxDevices: number;
  absoluteExpiry: number;
}
@Injectable()
export class RTokenRedisSession {
  private readonly logger = new Logger(RTokenRedisSession.name);
  private readonly luaScript = `
    local function refreshToken()
      local userDevicesKey = KEYS[1]
      local deviceTokenKey = KEYS[2]
      local jtiMappingKey = KEYS[3]
      local deviceJtiKey = KEYS[4]
      local devicePrevJtiKey = KEYS[5]
      local familyKey = KEYS[6]
      local familyExpiryKey = KEYS[7]  -- ← THÊM: Key lưu absolute expiry
      
      local deviceId = ARGV[1]
      local newJti = ARGV[2]
      local ttl = tonumber(ARGV[3])
      local now = tonumber(ARGV[4])
      local refreshTokenHash = ARGV[5]
      local prevJti = ARGV[6]
      local familyId = ARGV[7]
      
      -- Helper: Remove device completely
      local function removeDevice(oldDeviceId)
        local oldTokenKey = 'auth:device:' .. oldDeviceId .. ':rt'
        local oldJtiKey = 'auth:device:' .. oldDeviceId .. ':jti'
        local oldPrevJtiKey = 'auth:device:' .. oldDeviceId .. ':prev_jti'
   
        local oldJti = redis.call('GET', oldJtiKey)
        local oldPrevJti = redis.call('GET', oldPrevJtiKey)
        
        redis.call('DEL', oldTokenKey, oldJtiKey, oldPrevJtiKey)
        
        if oldJti then
          redis.call('DEL', 'auth:jti:' .. oldJti)
        end
        if oldPrevJti then
          redis.call('DEL', 'auth:jti:' .. oldPrevJti)
        end
        
        redis.call('ZREM', userDevicesKey, oldDeviceId)
      end
      
      -- Helper: reuse detected tokens in family
      local function invalidateFamily(fid)
        local familySetKey = 'auth:family:' .. fid
        local familyExpiryKey = 'auth:family:' .. fid .. ':expiry'  -- ← THÊM
        local members = redis.call('SMEMBERS', familySetKey)
        
        for _, memberJti in ipairs(members) do
          local memberDeviceId = redis.call('GET', 'auth:jti:' .. memberJti)
          if memberDeviceId then
            removeDevice(memberDeviceId)
          end
          redis.call('DEL', 'auth:jti:' .. memberJti)
        end
        
        redis.call('DEL', familySetKey)
        redis.call('DEL', familyExpiryKey)  -- ← THÊM: Xóa expiry key
        return #members
      end
      
      -- ========== KIỂM TRA Thời gian ========== 
      -- ← THÊM: tố đa của phiên đăng nhập có thể refresh
      local absoluteExpiry = redis.call('GET', familyExpiryKey)
      
      if not absoluteExpiry then
        -- Family không tồn tại hoặc đã hết hạn
        return {-6, 0, 0}  -- Error: FAMILY_NOT_FOUND
      end
      
      if tonumber(absoluteExpiry) < now then
        -- Đã vượt quá thời gian tối đa
        invalidateFamily(familyId)
        return {-7, 0, 0}  -- Error: ABSOLUTE_EXPIRY_EXCEEDED
      end
      -- ===============================================
      
      -- REUSE DETECTION: Verify prevJti is valid and current
      if not prevJti or prevJti == '' then
        return {-2, 0, 0}  -- Error: prevJti required
      end
      
      local storedDeviceId = redis.call('GET', 'auth:jti:' .. prevJti)
      
      if not storedDeviceId then
        -- prevJti doesn't exist (expired or already used)
        return {-3, 0, 0}  -- Error: token expired or invalid
      end
      
      if storedDeviceId ~= deviceId then
        -- prevJti belongs to different device
        return {-4, 0, 0}  -- Error: device mismatch
      end
      
      -- Check if prevJti is the current active JTI
      local currentJti = redis.call('GET', deviceJtiKey)
      
      if currentJti ~= prevJti then
        -- REUSE DETECTED: prevJti was already rotated
        local invalidatedCount = invalidateFamily(familyId)
        return {-1, 0, invalidatedCount}  -- Error: reuse detected
      end
      
      -- Verify token is in the same family
      local isInFamily = redis.call('SISMEMBER', familyKey, prevJti)
      if isInFamily == 0 then
        return {-5, 0, 0}  -- Error: token not in family
      end
      
      -- TOKEN ROTATION: Store old JTI as prev_jti
      redis.call('SET', devicePrevJtiKey, prevJti, 'EX', ttl)
      
      -- Delete old JTI mapping (no longer valid for refresh)
      redis.call('DEL', 'auth:jti:' .. prevJti)
      
      -- Update device timestamp
      redis.call('ZADD', userDevicesKey, now, deviceId)
      redis.call('EXPIRE', userDevicesKey, ttl)
      
      -- Store new refresh token hash
      redis.call('SET', deviceTokenKey, refreshTokenHash, 'EX', ttl)
      
      -- Store new JTI -> deviceId mapping
      redis.call('SET', jtiMappingKey, deviceId, 'EX', ttl)
      
      -- Update current JTI for device
      redis.call('SET', deviceJtiKey, newJti, 'EX', ttl)
      
      -- Add new JTI to family
      redis.call('SADD', familyKey, newJti)
      redis.call('EXPIRE', familyKey, ttl)
      
      -- ← QUAN TRỌNG: KHÔNG update familyExpiryKey ở đây
      -- Absolute expiry không thay đổi khi refresh
      -- Chỉ update TTL của key để tránh bị xóa sớm
      local remainingTime = tonumber(absoluteExpiry) - now
      redis.call('EXPIRE', familyExpiryKey, remainingTime)
      
      -- Return: [success=1, deviceCount, familySize]
      return {1, redis.call('ZCARD', userDevicesKey), redis.call('SCARD', familyKey)}
    end

    return refreshToken()
  `;

  constructor(private readonly redisService: RedisService) {}

  async execute(params: LoginCommandParams) {
    const keys = this.buildKeys(params);
    const args = this.buildArgs(params);


    const sha = await this.redisService.loadScript(this.luaScript);
    const [status, deviceCount, familySize] =
      await this.redisService.executeScriptBySha(
        sha,
        keys,
        args,
        this.luaScript,
      );
    if (status !== 1) {
      this.logger.warn(
        `🚨 TOKEN REUSE DETECTED: userId=${params.userId}, deviceId=${params.deviceId}, ` +
          `familyId=${params.familyId}, invalidatedTokens=${familySize}`,
      );
      throw new UnauthorizedException(RTokenRedisSession.getErrorCode(status));
    }
  }

  private buildKeys(params: LoginCommandParams): string[] {
    return [
      AuthRedisKey.userDevices(params.userId),
      AuthRedisKey.deviceToken(params.deviceId),
      AuthRedisKey.jtiMapping(params.jti),
      AuthRedisKey.deviceJti(params.deviceId),
      AuthRedisKey.tokenFamily(params.familyId),
      AuthRedisKey.familyExpiry(params.familyId), // ← THÊM
    ];
  }

  private buildArgs(params: LoginCommandParams): (string | number)[] {
    return [
      params.deviceId,
      params.jti,
      params.ttl,
      params.now,
      params.maxDevices,
      params.refreshTokenHash,
      params.familyId,
      params.absoluteExpiry,
    ];
  }

  static getErrorCode(status: number): {
    statusCode: ErrorCode;
    message: string;
  } {
    const errorMap: Record<number, any> = {
      '-1': {
        statusCode: ERROR_CODE.REDIS_AUTH_REUSE_DETECTED,
        message: 'Reuse detected',
      },
      '-2': {
        statusCode: ERROR_CODE.REDIS_AUTH_PREV_JTI_REQUIRED,
        message: 'Previous JTI is required',
      },
      '-3': {
        statusCode: ERROR_CODE.REDIS_AUTH_TOKEN_EXPIRED,
        message: 'Token is expired or invalid',
      },
      '-4': {
        statusCode: ERROR_CODE.REDIS_AUTH_DEVICE_MISMATCH,
        message: 'Token belongs to different device',
      },
      '-5': {
        statusCode: ERROR_CODE.REDIS_AUTH_TOKEN_NOT_IN_FAMILY,
        message: 'Token not in family',
      },
      '-6': {
        statusCode: ERROR_CODE.REDIS_AUTH_FAMILY_NOT_FOUND,
        message: 'Family not found',
      },
      '-7': {
        statusCode: ERROR_CODE.REDIS_AUTH_ABSOLUTE_EXPIRY_EXCEEDED,
        message: 'Absolute expiry exceeded',
      },
    };
    return errorMap[status.toString()] || 'UNKNOWN_ERROR';
  }
}
