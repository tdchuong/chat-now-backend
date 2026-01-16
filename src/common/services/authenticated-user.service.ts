import { comparePassword } from '@/common/utils';
import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';
import { User } from 'generated/prisma/client';

@Injectable()
export class AuthenticatedUserService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(username: string, password: string): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });
    if (!existingUser) {
      throw new Error('Invalid credentials');
    }
    const isPasswordValid = await comparePassword(
      password,
      existingUser.password,
    );
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }
    return existingUser;
  }
}
