import { AppConfigService } from '@/common/env/config.service';
import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: AppConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.jwtConfig.publicKey,
    });
  }

  async validate(payload: any) {
    return await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
  }
}
