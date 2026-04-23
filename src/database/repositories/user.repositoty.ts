import { BaseRepository } from '@/database/repositories/base.repository';
import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';
import { User } from 'generated/prisma/client';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.user);
  }

  async findByPhone(phone: string) {
    return this.findOne({
      where: { phone },
    });
  }
}
