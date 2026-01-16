import { LoginReqDto } from '@/features/auth/login/dto/login.req.dto';
import { Command } from '@nestjs/cqrs';

export class RefreshTokenCommand extends Command<any> {
  constructor(
    public readonly ip: string,
    public readonly refreshToken: string,
  ) {
    super();
  }
}
