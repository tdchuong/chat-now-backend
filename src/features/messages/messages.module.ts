import { AuthModule } from '@/features/auth/auth.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [AuthModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class MessagesModule {}
