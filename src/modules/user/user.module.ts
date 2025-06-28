import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IUserRepository } from '@modules/user/domain/repositories/user.repository.interface';
import {
  User,
  UserSchema,
} from '@modules/user/infrastructure/mongoose/schemas/user.schema';
import { UserRepository } from '@modules/user/infrastructure/mongoose/repositories/user.repository';
import { UserProfile } from '@modules/user/infrastructure/mappers/user.profile';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [
    UserProfile,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
  ],
  exports: ['IUserRepository'],
})
export class UserModule {}
