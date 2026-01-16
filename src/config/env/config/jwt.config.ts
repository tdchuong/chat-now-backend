import { JwtKeys } from '@/config/env/config/jwt-key.config';
import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  privateKey: JwtKeys.getPrivateKey(),
  publicKey: JwtKeys.getPublicKey(),
  accessExpiresIn: parseInt(process.env.JWT_ACCESS_EXPIRES_IN || '900', 10),
  refreshExpiresIn: parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '1296000', 10),
  refreshTokenMaxLifetime: parseInt(process.env.JWT_REFRESH_TOKEN_MAX_LIFETIME || '31536000', 10),
}));
