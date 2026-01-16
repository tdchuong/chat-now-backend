import { AuthenticatedUserService } from '@/common/services/authenticated-user.service';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authenticatedUserService: AuthenticatedUserService,
  ) {
    super({ usernameField: 'username' });
  }

  async validate(username: string, password: string) {
    return await this.authenticatedUserService.execute(username, password);
  }
}
