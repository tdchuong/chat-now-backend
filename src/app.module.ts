import { CommonModule } from '@common/common.module';
import { GlobalExceptionFilter } from '@common/exception-filters/global-exception.filter';
import { LoggingInterceptor } from '@common/interceptors/logger/logging.interceptor';
import { configModule } from '@configs/env/env.config';
import { mongooseModule } from '@configs/database/database-config.service';
import { loggerConfig, loggerModule } from '@configs/logger/logger.config';
import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerErrorInterceptor, LoggerModule } from 'nestjs-pino';
import { TransformInterceptor } from '@common/interceptors/transform/transform.interceptor';
@Module({
  imports: [
    configModule,
    mongooseModule,
    loggerModule,
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
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerErrorInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
