import { CustomValidationPipe } from '@/common/pipes/custom-validation.pipe';
import { envConfigModule } from '@/config/env/env-config.module';
import { jwtConfigModule } from '@/config/jwt/jwt-config.module';
import { loggerModule } from '@/config/logger/logger-config.module';
import { DatabaseModule } from '@/database/database.module';
import { AuthModule } from '@/features/auth/auth.module';
import { CommonModule } from '@common/common.module';
import { LoggingInterceptor } from '@common/interceptors/logger/logging.interceptor';
import { TransformInterceptor } from '@common/interceptors/transform/transform.interceptor';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { UserModule } from '@/features/users/user.module';
import { UserDeviceModule } from '@/features/user-device/user-device.module';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
@Module({
  imports: [
    envConfigModule,
    loggerModule,
    jwtConfigModule,
    DatabaseModule,
    CommonModule,
    AuthModule,
    UserModule,
    UserDeviceModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: LoggerErrorInterceptor,
    // },
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
