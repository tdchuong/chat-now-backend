import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';

class FingerprintDto {
  @ApiProperty({
    example: 'fJx9K2aBcD3eFgH4',
    description: 'Fingerprint visitor id',
  })
  @IsString()
  @IsNotEmpty()
  visitorId!: string;
}

class DeviceInfoDto {
  @ApiProperty({
    example: 'Windows',
  })
  @IsString()
  @IsNotEmpty()
  deviceName!: string;

  @ApiProperty({
    example: 'Windows',
  })
  @IsString()
  @IsNotEmpty()
  os!: string;

  @ApiProperty({
    example: '10',
  })
  @IsString()
  @IsNotEmpty()
  osVersion!: string;

  @ApiProperty({
    example: 'Chrome',
  })
  @IsString()
  @IsNotEmpty()
  browser!: string;

  @ApiProperty({
    example: '136.0.0.0',
  })
  @IsString()
  @IsNotEmpty()
  browserVersion!: string;

  @ApiPropertyOptional({
    example: 'Win32',
  })
  @IsOptional()
  @IsString()
  platform?: string;
}

export class LoginReqDto {
  @ApiProperty({
    example: 'user@gmail.com',
    description: 'Email hoặc số điện thoại',
  })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({
    example: 'Abc@123456',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({
    type: FingerprintDto,
  })
  @ValidateNested()
  @Type(() => FingerprintDto)
  fingerprint!: FingerprintDto;

  @ApiProperty({
    type: DeviceInfoDto,
  })
  @ValidateNested()
  @Type(() => DeviceInfoDto)
  deviceInfo!: DeviceInfoDto;
}
