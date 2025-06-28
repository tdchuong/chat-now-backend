// import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
// import {
//   createMap,
//   forMember,
//   mapFrom,
//   Mapper,
//   MappingProfile,
// } from '@automapper/core';
// import { Injectable } from '@nestjs/common';
// import { UserEntity } from '../../domain/entities/user.entity';
// import { User } from '@modules/user/infrastructure/mongoose/schemas/user.schema';

// @Injectable()
// export class UserProfile extends AutomapperProfile {
//   constructor(@InjectMapper() mapper: Mapper) {
//     super(mapper);
//   }

//   get profile(): MappingProfile {
//     return (mapper) => {
//       createMap(
//         mapper,
//         User,
//         UserEntity,
//         forMember(
//           (dest) => dest.getId(),
//           mapFrom((src) => src._id),
//         ),
//         forMember(
//           (dest) => dest.getFullName(),
//           mapFrom((src) => src.fullName),
//         ),
//       );

//       createMap(mapper, UserEntity, User);
//     };
//   }
// }
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import {
  createMap,
  forMember,
  mapFrom,
  Mapper,
  MappingProfile,
} from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../domain/entities/user.entity';
import { User } from '@modules/user/infrastructure/mongoose/schemas/user.schema';

@Injectable()
export class UserProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile(): MappingProfile {
    return (mapper) => {
      // Ánh xạ từ User (Mongoose schema) sang UserEntity
      createMap(
        mapper,
        User,
        UserEntity,
        forMember(
          (dest) => dest.getId(),
          mapFrom((src) => src._id), // Chuyển _id thành chuỗi
        ),
        forMember(
          (dest) => dest.getFullName(),
          mapFrom((src) => src.fullName),
        ),
        forMember(
          (dest) => dest.getEmail(),
          mapFrom((src) => src.email),
        ),
        forMember(
          (dest) => dest.getPassword(),
          mapFrom((src) => src.password),
        ),
        forMember(
          (dest) => dest.getAvatar(),
          mapFrom((src) => src.avatar),
        ),
        forMember(
          (dest) => dest.getDateOfBirth(),
          mapFrom((src) => src.dateOfBirth),
        ),
        forMember(
          (dest) => dest.getStatus(),
          mapFrom((src) => src.status),
        ),
        forMember(
          (dest) => dest.getPoint(),
          mapFrom((src) => src.point),
        ),
        forMember(
          (dest) => dest.getFriends(),
          mapFrom((src) => src.friends.map((id) => id.toString())), // Chuyển ObjectId thành chuỗi
        ),

        forMember(
          (dest) => dest.getDeletedAt(),
          mapFrom((src) => src.deletedAt),
        ),
      );

      // Ánh xạ từ UserEntity sang User (Mongoose schema)
      createMap(
        mapper,
        UserEntity,
        User,
        forMember(
          (dest) => dest._id,
          mapFrom((src) => src.getId()),
        ),
        forMember(
          (dest) => dest.fullName,
          mapFrom((src) => src.getFullName()),
        ),
        forMember(
          (dest) => dest.email,
          mapFrom((src) => src.getEmail()),
        ),
        forMember(
          (dest) => dest.password,
          mapFrom((src) => src.getPassword()),
        ),
        forMember(
          (dest) => dest.avatar,
          mapFrom((src) => src.getAvatar()),
        ),
        forMember(
          (dest) => dest.dateOfBirth,
          mapFrom((src) => src.getDateOfBirth()),
        ),
        forMember(
          (dest) => dest.status,
          mapFrom((src) => src.getStatus()),
        ),
        forMember(
          (dest) => dest.point,
          mapFrom((src) => src.getPoint()),
        ),

        forMember(
          (dest) => dest.deletedAt,
          mapFrom((src) => src.getDeletedAt()),
        ),
      );
    };
  }
}
