import { Module } from '@nestjs/common';
import { EnvConfigService } from './services/env-config.service';
import { GlobalExceptionFilter } from '@common/exception-filters/global-exception.filter';

@Module({
  providers: [EnvConfigService, GlobalExceptionFilter],
  exports: [EnvConfigService, GlobalExceptionFilter],
})
export class CommonModule {}
