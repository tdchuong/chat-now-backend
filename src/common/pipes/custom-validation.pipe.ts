import {
  Injectable,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class CustomValidationPipe extends ValidationPipe {
  constructor() {
    super({
      transform: true,// Tự động transform plain object sang DTO class
      whitelist: true,    // Loại bỏ các field không có trong DTO
      forbidNonWhitelisted: true,      // Throw error nếu có field không hợp lệ
      transformOptions: {
        enableImplicitConversion: true, // Tự động chuyển đổi kiểu dữ liệu cơ bản
      },
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map((error) => ({
          field: error.property,
          errors: Object.values(error.constraints || {}),
        }));
        return new BadRequestException({
          statusCode: 4222,
          message: 'Validation failed',
          errors: formattedErrors,
        });
      },
    });
  }
}
