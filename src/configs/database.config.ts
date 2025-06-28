import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvConfigService } from '@common/services/env-config.service';

export const mongooseConfig = MongooseModule.forRootAsync({
  imports: [ConfigModule],
  inject: [EnvConfigService],
  useFactory: async (configService: EnvConfigService) => ({
    uri: configService.databaseUrl,
  }),
});
