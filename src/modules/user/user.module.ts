import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IUserRepository } from '@modules/user/domain/repositories/user.repository.interface';
import {
  User,
  UserSchema,
} from '@modules/user/infrastructure/mongoose/schemas/user.schema';
import { UserRepository } from '@modules/user/infrastructure/mongoose/repositories/user.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
  ],
  exports: ['IUserRepository'],
})
export class UserModule {}
