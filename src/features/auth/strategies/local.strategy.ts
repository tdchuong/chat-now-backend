import { UserService } from '@/features/users/user.service';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({ usernameField: 'username' });
  }

  async validate(username: string, password: string) {
    return await this.userService.validateUserCredentials(username, password);
  }
}
