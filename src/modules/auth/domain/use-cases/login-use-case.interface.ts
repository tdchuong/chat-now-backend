import { LoginReqDto } from '@modules/auth/application/dto/login.dto';

export interface ILoginUseCase {
  execute(
    loginDto: LoginReqDto,
  ): Promise<{ accessToken: string; refreshToken: string }>;
}
