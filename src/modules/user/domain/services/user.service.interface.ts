import { User } from '@modules/user/infrastructure/mongoose/schemas/user.schema';
import { BaseServiceInterface } from '@common/base/services/base.interface.service';

export interface IUserService extends BaseServiceInterface<User> {}
