import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly config_service: ConfigService) {}
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let statusCode = 5000;
    let message: string = 'Internal server error';
    let errors: any;
    let stack: any | undefined;

    if (exception instanceof HttpException) {
      const res = exception.getResponse() as any;
      status = exception.getStatus();
      statusCode = res.statusCode || status;
      message = res.message;
      errors = res.errors;
    }

    if (
      this.config_service.get('NODE_ENV') === 'development' &&
      exception instanceof Error &&
      exception.stack
    ) {
      stack = exception.stack.split('\n');
    }

    response.status(status).json({
      statusCode,
      message,
      errors,
      stack,
      timestamp: new Date().toISOString(),
    });
  }
}
