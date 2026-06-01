import { UserNotFoundException } from '@/common/exceptions/user.exception';
import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetMeUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string) {
    const foundUser = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!foundUser) {
      throw new UserNotFoundException();
    }
    return {
      id: foundUser.id,
      displayName: foundUser.displayName,
      avatar: foundUser.avatarUrl,
    };
  }
}
