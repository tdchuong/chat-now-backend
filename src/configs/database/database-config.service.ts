import { CommonModule } from '@common/common.module';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

export const mongooseModule = MongooseModule.forRootAsync({
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    uri: configService.get<string>('DATABASE_URL')!,
    dbName: configService.get<string>('DATABASE_NAME')!,
  }),
});
