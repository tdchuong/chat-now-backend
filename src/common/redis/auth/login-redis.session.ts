import { AuthRedisKey } from '@/common/redis/auth/auth.redis-keys';
import { RedisService } from '@/common/redis/redis.service';
import { Injectable } from '@nestjs/common';

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
export class LoginRedisSession {
  private readonly luaScript = `
    --Login → Token A (jti: A1, family: F1)
    --Refresh → Token B (jti: B1, prev_jti: A1, family: F1)

    local function login()
      local userDevicesKey = KEYS[1] -- auth:user:{userId}:devices
      local deviceTokenKey = KEYS[2] -- auth:device:{deviceId}:rt
      local jtiMappingKey = KEYS[3] -- auth:jti:{jti}
      local deviceJtiKey = KEYS[4]  -- auth:device:{deviceId}:jti
      local familyKey = KEYS[5] -- auth:family:{familyId}
      local familyExpiryKey = KEYS[6]  -- ← THÊM: Key lưu absolute expiry
      
      local deviceId = ARGV[1]
      local jti = ARGV[2]
      local ttl = tonumber(ARGV[3])
      local now = tonumber(ARGV[4])
      local maxDevices = tonumber(ARGV[5])
      local refreshTokenHash = ARGV[6]
      local familyId = ARGV[7]
      local absoluteExpiry = tonumber(ARGV[8])  -- ← THÊM
      
      -- Helper: Remove device completely
      local function removeDevice(oldDeviceId)
        local oldTokenKey = 'auth:device:' .. oldDeviceId .. ':rt'
        local oldJtiKey = 'auth:device:' .. oldDeviceId .. ':jti'
        local oldPrevJtiKey = 'auth:device:' .. oldDeviceId .. ':prev_jti'-- remove old id family 

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
      
      -- Check device limit and enforce
      local currentCount = redis.call('ZCARD', userDevicesKey)
      local existingScore = redis.call('ZSCORE', userDevicesKey, deviceId)
      
      -- If this is a new device and limit reached, remove oldest
      if not existingScore and currentCount >= maxDevices then
        local oldestDevices = redis.call('ZRANGE', userDevicesKey, 0, 0)
        if #oldestDevices > 0 then
          removeDevice(oldestDevices[1])
        end
      end
      
      -- If device exists, clean up old tokens
      if existingScore then
        removeDevice(deviceId)
      end
      
      -- Create new session
      redis.call('ZADD', userDevicesKey, now, deviceId)
      redis.call('EXPIRE', userDevicesKey, ttl)
      
      -- Store refresh token hash
      redis.call('SET', deviceTokenKey, refreshTokenHash, 'EX', ttl)
      
      -- Store JTI -> deviceId mapping
      redis.call('SET', jtiMappingKey, deviceId, 'EX', ttl)
      
      -- Store current JTI for device
      redis.call('SET', deviceJtiKey, jti, 'EX', ttl)
      
      -- Create new token family
      redis.call('SADD', familyKey, jti)
      redis.call('EXPIRE', familyKey, ttl)

       -- ← LƯU ABSOLUTE EXPIRY (không thay đổi khi refresh)
      local absoluteTTL = absoluteExpiry + now
      redis.call('SET', familyExpiryKey, absoluteTTL, 'EX',absoluteExpiry)
      
      -- Return: [deviceCount, wasExisting]
      --trả về 1 nếu device đã tồn tại trước đó, 0 nếu device mới
      return {redis.call('ZCARD', userDevicesKey), existingScore ~= false and 1 or 0}
    end

    return login()
  `;

  constructor(private readonly redisService: RedisService) {}

  async execute(params: LoginCommandParams) {
    const keys = this.buildKeys(params);
    const args = this.buildArgs(params);
    const sha = await this.redisService.loadScript(this.luaScript);
    const result = await this.redisService.executeScriptBySha(
      sha,
      keys,
      args,
      this.luaScript,
    );
    return {
      deviceCount: result[0],
      wasExisting: result[1] === 1,
    };
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
}
