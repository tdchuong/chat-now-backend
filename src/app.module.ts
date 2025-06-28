import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { CommonModule } from '@common/common.module';
import { GlobalExceptionFilter } from '@common/exception-filters/global-exception.filter';
import { EnvConfigService } from '@common/services/env-config.service';
import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.env.production'
          : '.env.development',
    }),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    MongooseModule.forRootAsync({
      imports: [CommonModule],
      inject: [EnvConfigService],
      useFactory: async (configService: EnvConfigService) => ({
        uri: configService.databaseUrl,
        dbName: configService.databaseName,
      }),
    }),
    CommonModule,
    UserModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
