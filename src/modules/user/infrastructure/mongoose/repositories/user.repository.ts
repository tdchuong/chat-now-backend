import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepositoryAbstract } from '@common/base/repositories/base.abstract.repository';
import {
  User,
  UserDocument,
} from '@modules/user/infrastructure/mongoose/schemas/user.schema';
import { UserEntity } from '@modules/user/domain/entities/user.entity';
import { IUserRepository } from '@modules/user/domain/repositories/user.repository.interface';
import { UserMapper } from '@modules/user/infrastructure/mappers/user.mapper';

@Injectable()
export class UserRepository
  extends BaseRepositoryAbstract<UserDocument, UserEntity>
  implements IUserRepository
{
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {
    super(
      userModel,
      (userDoc: UserDocument) => UserMapper.toDomain(userDoc), // Ánh xạ từ User schema sang UserEntity
      (entity: UserEntity) => UserMapper.toPersistence(entity), // Ánh xạ ngược từ UserEntity về User schema
    );
  }
}
