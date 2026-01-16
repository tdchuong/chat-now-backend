import { CustomValidationPipe } from '@/common/pipes/custom-validation.pipe';
import { envConfigModule } from '@/config/env/env-config.module';
import { jwtConfigModule } from '@/config/jwt/jwt-config.module';
import { loggerModule } from '@/config/logger/logger-config.module';
import { DatabaseModule } from '@/database/database.module';
import { AuthModule } from '@/features/auth/auth.module';
import { CommonModule } from '@common/common.module';
import { GlobalExceptionFilter } from '@/common/filters/global-exception.filter';
import { LoggingInterceptor } from '@common/interceptors/logger/logging.interceptor';
import { TransformInterceptor } from '@common/interceptors/transform/transform.interceptor';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { LoggerErrorInterceptor } from 'nestjs-pino';
@Module({
  imports: [
    envConfigModule,
    loggerModule,
    jwtConfigModule,
    CqrsModule.forRoot(),
    DatabaseModule,
    CommonModule,
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
    {
      provide: APP_PIPE,
      useClass: CustomValidationPipe,
    },
  ],
})
export class AppModule {}
