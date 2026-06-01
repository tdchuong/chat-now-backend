import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsNumber,
  MinLength,
  MaxLength,
  IsDate,
} from 'class-validator';
import { Gender, UserRole, UserStatus } from 'generated/prisma/enums';

export class CreateUserDto {
  // ======================
  // REQUIRED
  // ======================

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  username!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  displayName!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  phone!: string;

  @Transform(({ value }) => new Date(value))
  @IsDate()
  dateOfBirth!: Date;

  // ======================
  // ENUMS
  // ======================

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  // ======================
  // PROFILE
  // ======================

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  isBanned?: boolean;

  @IsOptional()
  @IsDateString()
  bannedUntil?: string;

  // ======================
  // ADDRESS
  // ======================

  @IsOptional()
  @IsString()
  addressStreet?: string;

  @IsOptional()
  @IsString()
  addressWard?: string;

  @IsOptional()
  @IsString()
  addressDistrict?: string;

  @IsOptional()
  @IsString()
  addressCity?: string;

  @IsOptional()
  @IsString()
  addressCountry?: string;

  // ======================
  // LOCATION
  // ======================

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  // ======================
  // PRIVACY SETTINGS
  // ======================

  @IsOptional()
  @IsString()
  onlineStatusVisibility?: string;

  @IsOptional()
  @IsString()
  lastSeenVisibility?: string;

  @IsOptional()
  @IsString()
  profileVisibility?: string;

  @IsOptional()
  @IsString()
  locationVisibility?: string;
}
