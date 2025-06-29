import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginReqDto } from '../dto/login.dto';
import { IAuthenticatedUserUseCase } from '@modules/auth/domain/use-cases/authenticate-user-use-case.interface';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('IAuthenticatedUserUseCase')
    private readonly authenticatedUserUseCase: IAuthenticatedUserUseCase,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    loginDto: LoginReqDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.authenticatedUserUseCase.execute(loginDto);

    const payload = {
      sub: user.getId(),
      email: user.getEmail(),
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET, // Sửa: Bỏ dấu nháy thừa
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET, // Sửa: Bỏ dấu nháy thừa
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}
