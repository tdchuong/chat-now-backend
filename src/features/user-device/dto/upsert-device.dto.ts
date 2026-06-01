import {
  IsString,
  IsOptional,
  IsBoolean,
  IsIP,
  IsNotEmpty,
} from 'class-validator';

export class UpsertDeviceDto {
  // 🔐 REQUIRED - fingerprint luôn bắt buộc
  @IsString()
  @IsNotEmpty()
  fingerprintHash!: string;

  // 👤 optional relation
  @IsOptional()
  @IsString()
  userId?: string;

  // 📱 device info
  @IsOptional()
  @IsString()
  deviceName?: string;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsString()
  os?: string;

  @IsOptional()
  @IsString()
  osVersion?: string;

  @IsOptional()
  @IsString()
  browser?: string;

  @IsOptional()
  @IsString()
  browserVersion?: string;

  @IsOptional()
  @IsString()
  appVersion?: string;

  @IsString()
  @IsNotEmpty()
  ipLast!: string; // luôn update lần cuối

  @IsOptional()
  @IsString()
  userAgent?: string;

  // 🔒 security flags
  @IsOptional()
  @IsBoolean()
  isTrusted?: boolean;
}
