import { existsSync, readFileSync, statSync } from 'fs';

export class JwtKeys {
  private static getEnvPath(envVar: string): string {
    const value = process.env[envVar];
    if (!value) {
      throw new Error(`${envVar} is not defined in environment variables`);
    }
    return value;
  }
  private static getKey(path: string) {
    if (!existsSync(path)) {
      throw new Error(`${path} key file does not exist at path: ${path}`);
    }
    const stats = statSync(path);
    return readFileSync(path, 'utf8');
  }
  static getPrivateKey(): string {
    const privateKeyPath = this.getEnvPath('JWT_PRIVATE_KEY_PATH');

    return this.getKey(privateKeyPath);
  }

  static getPublicKey(): string {
    const publicKeyPath = this.getEnvPath('JWT_PUBLIC_KEY_PATH');
    return this.getKey(publicKeyPath);
  }
}
