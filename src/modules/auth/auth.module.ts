import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './application/services/auth.service';
import { AuthController } from './presentation/controllers/auth.controller';
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';
import {
  User,
  UserSchema,
} from '@modules/user/infrastructure/mongoose/schemas/user.schema';
import { UserRepository } from '@modules/user/infrastructure/mongoose/repositories/user.repository';
import { LoginUseCase } from '@modules/auth/application/use-cases/login.use-case';
import { RegisterUseCase } from '@modules/auth/application/use-cases/register.use-case';
import { AuthenticatedUserUseCase } from '@modules/auth/application/use-cases/authenticated-user.use-case';
import { UserModule } from '@modules/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: 'secretKey',
      signOptions: { expiresIn: '1h' },
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepository,
    JwtAuthGuard,
    {
      provide: 'IAuthService',
      useClass: AuthService,
    },

    {
      provide: 'ILoginUseCase',
      useClass: LoginUseCase,
    },
    {
      provide: 'IRegisterUseCase',
      useClass: RegisterUseCase,
    },
    {
      provide: 'IAuthenticatedUserUseCase',
      useClass: AuthenticatedUserUseCase,
    },
  ],
  exports: [UserRepository, JwtAuthGuard],
})
export class AuthModule {}
