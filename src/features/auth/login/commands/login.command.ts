import { LoginReqDto } from '@/features/auth/login/dto/login.req.dto';
import { Command } from '@nestjs/cqrs';
import { User } from 'generated/prisma/browser';

export class LoginCommand extends Command<any> {
  constructor(
    public readonly user: User,
    public readonly fingerprint: Record<string, any>,
    public readonly deviceInfo: {
      deviceName: string;
      os: string;
      osVersion: string;
      browser?: string;
      browserVersion?: string;
      appVersion?: string;
    },
    public readonly ip: string,
    public readonly userAgent: string,
    public readonly rememberDevice?: boolean,
  ) {
    super();
  }
  static from(dto: LoginReqDto, user: User) {
    return new LoginCommand(
      user,
      dto.fingerprint,
      dto.deviceInfo,
      dto.ip,
      dto.userAgent,
      dto.rememberDevice,
    );
  }
}
