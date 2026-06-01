import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserDeviceService {
  constructor(private prisma: PrismaService) {}


}
