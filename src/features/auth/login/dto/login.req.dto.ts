
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class DeviceFingerprintDto {
  @ApiProperty({
    description: 'Canvas fingerprint (hash hoặc raw data)',
    example: 'f1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6',
  })
  @IsString()
  @IsNotEmpty()
  canvas: string;

  @ApiProperty({
    description: 'WebGL fingerprint',
    example: 'a9b8c7d6e5f4g3h2i1j0k9l8m7n6o5p4',
  })
  @IsString()
  @IsNotEmpty()
  webgl: string;

  @ApiProperty({
    description: 'AudioContext fingerprint',
    example: '1234567890abcdef1234567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  audio: string;

  @ApiProperty({
    description: 'Screen resolution + color depth',
    example: '390x844x32',
  })
  @IsString()
  @IsNotEmpty()
  screen: string;

  @ApiProperty({ example: 'Asia/Ho_Chi_Minh' })
  @IsString()
  @IsNotEmpty()
  timezone: string;

  @ApiProperty({ example: 'vi-VN,vi,en-US,en' })
  @IsString()
  @IsNotEmpty()
  languages: string;

  @ApiProperty({ example: 'iPhone' })
  @IsString()
  @IsNotEmpty()
  platform: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsString({ each: true })
  fonts?: string[];

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  hardwareConcurrency?: number;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  deviceMemory?: number;
}

// 2. Thông tin thiết bị (hiển thị tên đẹp trong danh sách thiết bị)
class DeviceInfoDto {
  @ApiProperty({ example: 'iPhone 14 Pro Max' })
  @IsString()
  @IsNotEmpty()
  deviceName: string;

  @ApiProperty({ example: 'iOS' })
  @IsString()
  @IsNotEmpty()
  os: string;

  @ApiProperty({ example: '17.5.1' })
  @IsString()
  @IsNotEmpty()
  osVersion: string;

  @ApiPropertyOptional({ example: 'Safari' })
  @IsOptional()
  @IsString()
  browser?: string;

  @ApiPropertyOptional({ example: '605.1.15' })
  @IsOptional()
  @IsString()
  browserVersion?: string;

  @ApiPropertyOptional({ example: '2.15.0' })
  @IsOptional()
  @IsString()
  appVersion?: string; // chỉ có trên mobile app
}

// 3. DTO chính
export class LoginReqDto {
  @ApiProperty({ example: 'username hoặc email hoặc phone' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'Abc@123456' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ type: DeviceFingerprintDto })
  @ValidateNested()
  @Type(() => DeviceFingerprintDto)
  fingerprint: DeviceFingerprintDto;

  @ApiProperty({ type: DeviceInfoDto })
  @ValidateNested()
  @Type(() => DeviceInfoDto)
  deviceInfo: DeviceInfoDto;

  @ApiPropertyOptional({
    description:
      'Client có thể gửi nếu muốn, nhưng server sẽ override bằng req.ip',
  })
  @IsOptional()
  @IsString()
  ip: string;

  @ApiPropertyOptional({
    description: 'Server sẽ tự fill từ header',
  })
  @IsOptional()
  @IsString()
  userAgent: string;

  @ApiPropertyOptional({
    description: 'Client tick "Nhớ thiết bị này" (trust this device)',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  rememberDevice?: boolean = false;
}
