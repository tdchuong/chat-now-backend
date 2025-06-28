import { LoginReqDto } from '@modules/auth/application/dto/login.dto';
import { UserEntity } from '@modules/user/domain/entities/user.entity';

export interface IAuthenticatedUserUseCase {
  execute(loginDto: LoginReqDto): Promise<UserEntity>;
}
