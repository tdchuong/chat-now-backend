export class AuthRedisKey {
  static userDevices(userId: string): string {
    return `auth:user:${userId}:devices`;
  }

  static deviceToken(deviceId: string): string {
    return `auth:device:${deviceId}:rt`;
  }

  static deviceJti(deviceId: string): string {
    return `auth:device:${deviceId}:jti`;
  }

  static devicePrevJti(deviceId: string): string {
    return `auth:device:${deviceId}:prev_jti`;
  }

  static jtiMapping(jti: string): string {
    return `auth:jti:${jti}`;
  }

  static tokenFamily(familyId: string): string {
    return `auth:family:${familyId}`;
  }

  static familyExpiry(familyId: string): string {
    return `auth:family:${familyId}:absolute_expiry`;
  }
}
