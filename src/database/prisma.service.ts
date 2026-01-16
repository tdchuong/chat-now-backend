import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    super({ adapter, log: ['query', 'info', 'warn', 'error'] });
  }
  async onModuleInit() {
    await this.$connect(); // NestJS gọi hàm này khi module khởi chạy → server vừa bật là connect DB 1 lần duy nhất.
  }

  async onModuleDestroy() {
    await this.$disconnect(); // NestJS gọi hàm này khi module tắt → server tắt là ngắt kết nối DB.
  }
}
