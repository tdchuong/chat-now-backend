import { InvalidCredentialsException } from '@/common/exceptions/user.exception';
import { verifyPassword } from '@/common/utils';
import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';
import { User } from 'generated/prisma/client';
import { UserCreateInput } from 'generated/prisma/models';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async validateUserCredentials(
    username: string,
    password: string,
  ): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });
    if (!existingUser) {
      throw new InvalidCredentialsException();
    }
    const isPasswordValid = await verifyPassword(
      existingUser.password,
      password,
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }
    return existingUser;
  }

  async findByPhone(phone: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { phone },
    });
  }

  async create(dto: UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data: dto,
    });
  }
}
