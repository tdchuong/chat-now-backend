import { BaseRepository } from '@/database/repositories/base.repository';
import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';
import { UserDevice } from 'generated/prisma/client';
import { hashFingerprint } from '@/common/utils';

@Injectable()
export class UserDeviceRepository extends BaseRepository<UserDevice> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.userDevice);
  }
}
