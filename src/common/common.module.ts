import { Module } from '@nestjs/common';
import { GlobalExceptionFilter } from '@common/exception-filters/global-exception.filter';

@Module({
  providers: [GlobalExceptionFilter],
  exports: [GlobalExceptionFilter],
})
export class CommonModule {}
