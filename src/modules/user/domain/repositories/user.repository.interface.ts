import { IBaseRepository } from '@common/base/repositories/base.repository';
import { UserEntity } from '@modules/user/domain/entities/user.entity';

export interface IUserRepository extends IBaseRepository<UserEntity> {}
