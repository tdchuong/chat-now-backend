import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginReqDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
export class LoginResDto {
  @IsString()
  accessToken: string;
  refreshToken: string;
}
