import { LoginReqDto } from '@modules/auth/application/dto/login.dto';
import { IAuthenticatedUserUseCase } from '@modules/auth/domain/use-cases/authenticate-user-use-case.interface';
import { UserEntity } from '@modules/user/domain/entities/user.entity';
import { IUserRepository } from '@modules/user/domain/repositories/user.repository.interface';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthenticatedUserUseCase implements IAuthenticatedUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(loginDto: LoginReqDto): Promise<UserEntity> {
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
    return existingUser;
  }

  private async comparePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
