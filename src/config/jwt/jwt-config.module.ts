import { AppConfigService } from '@/common/env/config.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

export const jwtConfigModule = JwtModule.registerAsync({
  global: true,
  imports: [ConfigModule],
  inject: [AppConfigService],
  useFactory: async (configService: AppConfigService) => ({
    privateKey: configService.jwtConfig.privateKey,
    publicKey: configService.jwtConfig.publicKey, // string
    signOptions: {
      algorithm: 'RS256',
    },
  }),
});
