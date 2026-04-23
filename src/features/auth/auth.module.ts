import { LoginHandler } from '@/features/auth/login/login.use-case';
import { LoginController } from '@/features/auth/login/login.controller';
import { RegisterHandler } from '@/features/auth/register/register.use-case';
import { RegisterController } from '@/features/auth/register/register.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [LoginController, RegisterController],
  providers: [LoginHandler, RegisterHandler],
})
export class AuthModule {}
