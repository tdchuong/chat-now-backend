import { EnvConfigService } from '@common/services/env-config.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

export const mongooseConfig = MongooseModule.forRootAsync({
  imports: [ConfigModule],
  inject: [EnvConfigService],
  useFactory: async (configService: EnvConfigService) => ({
    uri: configService.databaseUrl,
  }),
});
