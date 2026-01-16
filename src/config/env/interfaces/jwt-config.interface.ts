export interface JwtConfig {
  privateKey: string;
  publicKey: string;
  accessExpiresIn: number;
  refreshExpiresIn: number;
  refreshTokenMaxLifetime: number;
}
