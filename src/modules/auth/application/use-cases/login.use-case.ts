import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUserRepository } from '@modules/user/domain/repositories/user.repository.interface';
import * as bcrypt from 'bcrypt';
import { LoginReqDto } from '@modules/auth/application/dto/login.dto';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}
  z;
  async execute(
    loginDto: LoginReqDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const existingUser = await this.userRepository.findOneByCondition({
      email: loginDto.email,
    });
    if (!existingUser) {
      throw new UnauthorizedException('User not found');
    }
    const isPasswordValid = await this.comparePassword(
      loginDto.password,
      existingUser.getPassword(),
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: existingUser.getPassword(),
      email: existingUser.getEmail(),
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  private async comparePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
