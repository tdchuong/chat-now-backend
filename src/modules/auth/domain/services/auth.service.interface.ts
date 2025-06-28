import { LoginReqDto, LoginResDto } from '@modules/auth/application/dto/login.dto';
import { RegisterReqDto } from '@modules/auth/application/dto/register.dto';
import { UserEntity } from '@modules/user/domain/entities/user.entity';

export interface IAuthService {
  login(
    loginDto: LoginReqDto,
  ): Promise<LoginResDto>;
  register(registerDto: RegisterReqDto): Promise<void>;
  getAuthenticatedUser(email: string, password: string): Promise<UserEntity | null>;
  // refreshToken(
  //   refreshTokenDto: RefreshTokenDto,
  // ): Promise<{ accessToken: string; refreshToken: string }>;
  // forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void>;
}
