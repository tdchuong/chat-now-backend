import { IAuthService } from '@modules/auth/domain/services/auth.service.interface';
import { ILoginUseCase } from '@modules/auth/domain/use-cases/login-use-case.interface';
import { IRegisterUseCase } from '@modules/auth/domain/use-cases/register-use-case.interface';
import { Inject, Injectable } from '@nestjs/common';
import { IAuthenticatedUserUseCase } from '@modules/auth/domain/use-cases/authenticate-user-use-case.interface';
import { LoginReqDto } from '@modules/auth/application/dto/login.dto';
import { RegisterReqDto } from '@modules/auth/application/dto/register.dto';
import { UserEntity } from '@modules/user/domain/entities/user.entity';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject('ILoginUseCase')
    private readonly loginUseCase: ILoginUseCase,

    @Inject('IRegisterUseCase')
    private readonly registerUseCase: IRegisterUseCase,

    @Inject('IAuthenticatedUserUseCase')
    private readonly authenticatedUserUseCase: IAuthenticatedUserUseCase,
  ) {}

  async login(
    loginDto: LoginReqDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.loginUseCase.execute(loginDto);
  }

  async register(registerDto: RegisterReqDto): Promise<void> {
    return this.registerUseCase.execute(registerDto);
  }

  async getAuthenticatedUser(
    email: string,
    password: string,
  ): Promise<UserEntity | null> {
    return this.authenticatedUserUseCase.execute({
      email,
      password,
    });
  }
}
