import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvConfigService {
  constructor(private configService: ConfigService) {}

  // #region: mongodb connection
  // get databaseUrl(): string {
  //   const host = this.configService.get<string>('DATABASE_HOST');
  //   const port = this.configService.get<string>('DATABASE_PORT');
  //   const username = this.configService.get<string>('DATABASE_USERNAME');
  //   const password = this.configService.get<string>('DATABASE_PASSWORD');
  //   const dbName = this.configService.get<string>('DATABASE_NAME');
  //   // Tạo chuỗi kết nối MongoDB
  //   return `mongodb://${username}:${password}@${host}:${port}/${dbName}`;
  // }

  get databaseName(): string {
    return this.getString('DATABASE_NAME');
  }
  get databaseUrl(): string {
    console.log('Database URL >>>>', this.getString('DATABASE_URL'));
    console.log('Database URL >>>>', this.getString('DATABASE_URL'));

    return this.getString('DATABASE_URL');
  }

  // #endregion

  // #region: get method
  private get(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
  }
  private getString(key: string): string {
    const value = this.get(key);
    return value.replaceAll(String.raw`\n`, '\n');
  }

  private getNumber(key: string): number {
    const value = this.get(key);
    try {
      return Number(value);
    } catch {
      throw new Error(`${key} environment variable is not a number`);
    }
  }
  private getBoolean(key: string): boolean {
    const value = this.get(key);
    if (value === 'true') {
      return true;
    } else if (value === 'false') {
      return false;
    } else {
      throw new Error(`${key} environment variable is not a boolean`);
    }
  }
  // #endregion
}
