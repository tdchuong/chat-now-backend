import { UserEntity } from '@modules/user/domain/entities/user.entity';
import {
  User,
  UserDocument,
} from '@modules/user/infrastructure/mongoose/schemas/user.schema';
import { Types } from 'mongoose';

export class UserMapper {
  /**
   * Chuyển từ MongoDB Document sang Domain Entity
   */
  static toDomain(userDoc: UserDocument): UserEntity {
    if (!userDoc) {
      throw new Error('UserDocument is required');
    }
    const userEntity = new UserEntity();

    userEntity.setId(userDoc._id.toString());
    userEntity.setFullName(userDoc.fullName);
    userEntity.setEmail(userDoc.email);
    userEntity.setPassword(userDoc.password);
    userEntity.setAvatar(userDoc.avatar);
    userEntity.setDateOfBirth(userDoc.dateOfBirth);
    userEntity.setStatus(userDoc.status as 'online' | 'offline');
    userEntity.setPoint(userDoc.point);
    userEntity.setFriends(userDoc.friends.map((friend) => friend.toString()));
    userEntity.setCreatedAt(userDoc.createdAt);
    userEntity.setUpdatedAt(userDoc.updatedAt);
    if (userDoc.deletedAt) {
      userEntity.setDeletedAt(userDoc.deletedAt);
    }

    return userEntity;
  }

  /**
   * Chuyển từ Domain Entity sang MongoDB Document data
   */
  static toPersistence(userEntity: UserEntity): Partial<User> {
    if (!userEntity) {
      throw new Error('UserEntity is required');
    }

    return {
      _id: userEntity.getId(), // Chuyển ID sang ObjectId
      fullName: userEntity.getFullName(),
      email: userEntity.getEmail(),
      password: userEntity.getPassword(),
      avatar: userEntity.getAvatar(),
      dateOfBirth: userEntity.getDateOfBirth(),
      status: userEntity.getStatus(),
      point: userEntity.getPoint(),
      friends: userEntity
        .getFriends()
        .map((friendId) => new Types.ObjectId(friendId)),
      deletedAt: userEntity.getDeletedAt(),
    };
  }

  /**
   * Chuyển từ Domain Entity sang DTO (cho API response)
   */
  static toDto(userEntity: UserEntity): UserDto {
    if (!userEntity) {
      throw new Error('UserEntity is required');
    }

    return {
      id: userEntity.getId(),
      fullName: userEntity.getFullName(),
      email: userEntity.getEmail(),
      avatar: userEntity.getAvatar(),
      dateOfBirth: userEntity.getDateOfBirth(),
      status: userEntity.getStatus(),
      point: userEntity.getPoint(),
      friendsCount: userEntity.getFriends().length,
      createdAt: userEntity.getCreatedAt(),
      updatedAt: userEntity.getUpdatedAt(),
    };
  }

  /**
   * Chuyển từ Create DTO sang Domain Entity
   */
  static fromCreateDto(createUserDto: CreateUserDto): UserEntity {
    const userEntity = new UserEntity();

    userEntity.setFullName(createUserDto.fullName);
    userEntity.setEmail(createUserDto.email);
    userEntity.setPassword(createUserDto.password); // Nên hash trước khi lưu
    userEntity.setAvatar(
      createUserDto.avatar ||
        'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png',
    );
    if (createUserDto.dateOfBirth) {
      userEntity.setDateOfBirth(createUserDto.dateOfBirth);
    }
    userEntity.setStatus('offline');
    userEntity.setPoint(0);
    userEntity.setFriends([]);
    userEntity.setCreatedAt(new Date());
    userEntity.setUpdatedAt(new Date());

    return userEntity;
  }

  /**
   * Chuyển từ Update DTO sang partial Domain Entity data
   */
  static fromUpdateDto(updateUserDto: UpdateUserDto): Partial<UserEntity> {
    const updateData: any = {};

    if (updateUserDto.fullName !== undefined) {
      updateData.fullName = updateUserDto.fullName;
    }
    if (updateUserDto.avatar !== undefined) {
      updateData.avatar = updateUserDto.avatar;
    }
    if (updateUserDto.dateOfBirth !== undefined) {
      updateData.dateOfBirth = updateUserDto.dateOfBirth;
    }
    if (updateUserDto.status !== undefined) {
      updateData.status = updateUserDto.status;
    }

    updateData.updatedAt = new Date();

    return updateData;
  }

  /**
   * Chuyển array UserDocument sang array UserEntity
   */
  static toDomainList(userDocs: UserDocument[]): UserEntity[] {
    return userDocs.map((doc) => this.toDomain(doc));
  }

  /**
   * Chuyển array UserEntity sang array DTO
   */
  static toDtoList(userEntities: UserEntity[]): UserDto[] {
    return userEntities.map((entity) => this.toDto(entity));
  }
}

// Types cho DTO
export interface UserDto {
  id: string;
  fullName: string;
  email: string;
  avatar: string;
  dateOfBirth?: Date;
  status: 'online' | 'offline';
  point: number;
  friendsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  fullName: string;
  email: string;
  password: string;
  avatar?: string;
  dateOfBirth?: Date;
}

export interface UpdateUserDto {
  fullName?: string;
  avatar?: string;
  dateOfBirth?: Date;
  status?: 'online' | 'offline';
}
