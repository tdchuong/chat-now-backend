import { BaseRepositoryAbstract } from '@common/base/repositories/base.abstract.repository';
import { BaseServiceAbstract } from '@common/base/services/base.abstract.service';
import { User } from '@modules/user/infrastructure/mongoose/schemas/user.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor() {}
}
