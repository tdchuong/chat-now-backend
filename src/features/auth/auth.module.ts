import { LoginHandler } from '@/features/auth/login/commands/login.handler';
import { LoginController } from '@/features/auth/login/login.controller';
import { RegisterHandler } from '@/features/auth/register/command/register.handler';
import { RegisterController } from '@/features/auth/register/register.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [LoginController, RegisterController],
  providers: [LoginHandler, RegisterHandler],
})
export class AuthModule {}
