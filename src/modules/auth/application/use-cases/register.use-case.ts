import { RegisterReqDto } from '@modules/auth/application/dto/register.dto';
import { RegisterCredentials } from '@modules/auth/domain/types/register-credentials.type';
import { IRegisterUseCase } from '@modules/auth/domain/use-cases/register-use-case.interface';
import { UserEntity } from '@modules/user/domain/entities/user.entity';
import { IUserRepository } from '@modules/user/domain/repositories/user.repository.interface';
import { IUserService } from '@modules/user/domain/services/user.service.interface';
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RegisterUseCase implements IRegisterUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(registerDto: RegisterReqDto): Promise<void> {
    const existingUser = await this.userRepository.findOneByCondition({
      email: registerDto.email,
    });
    if (existingUser) {
      throw new ConflictException('Email already existed!!');
    }

    const hashedPassword = await this.hashPassword(registerDto.password);
    
    const newUser = new UserEntity();
    newUser.setEmail(registerDto.email);
    newUser.setPassword(hashedPassword);
    newUser.setFullName(registerDto.fullName);
    newUser.setPoint(0);
    newUser.setFriends([]);
    

    const user = await this.userRepository.create(newUser);
    const payload = { sub: user.getId(), email: user.getEmail() };
    const accessToken = this.jwtService.sign(payload);
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}
