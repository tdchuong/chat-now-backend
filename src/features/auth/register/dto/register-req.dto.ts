import { Transform } from 'class-transformer';
import { IsDate, IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Gender } from 'generated/prisma/enums';

export class RegisterReqDto {
  @IsString()
  @MinLength(2)
  fullName: string;

  @IsString()
  phone: string;

  @IsString()
  @MinLength(6)
  password: string;

  @Transform(({ value }) => new Date(value))
  @IsDate()
  dateOfBirth: Date;

  @IsEnum(Gender)
  gender: Gender;
}
