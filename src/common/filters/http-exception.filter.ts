import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { Request, Response } from 'express';

interface ValidationError {
  field: string;
  message: string;
}

interface ErrorResponse {
  errorCode: string;
  message: string;
  errors?: ValidationError[];
}

interface ExceptionResponseBody {
  errorCode?: string;
  message?: string;
  errors?: ValidationError[];
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();

    if (!(exception instanceof HttpException)) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        errorCode: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong. Please try again later.',
      } satisfies ErrorResponse);
    }

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    const body: ExceptionResponseBody =
      typeof exceptionResponse === 'string'
        ? {
            message: exceptionResponse,
          }
        : (exceptionResponse as ExceptionResponseBody);

    return response.status(status).json({
      errorCode: body.errorCode ?? this.statusToErrorCode(status),
      message: body.message ?? exception.message,
      ...(body.errors ? { errors: body.errors } : {}),
    } satisfies ErrorResponse);
  }


  private statusToErrorCode(status: number): string {
    const map: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      429: 'RATE_LIMIT_EXCEEDED',
    };

    return map[status] ?? 'API_ERROR';
  }
}
