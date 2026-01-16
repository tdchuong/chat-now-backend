import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(LoggingInterceptor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          const duration = Date.now() - now;
          this.logger.info(`${method} ${url} ${statusCode} ${duration}ms`);
        },
        error: (err) => {
          const duration = Date.now() - now;
          this.logger.error({
            method,
            url,
            error: err.message,
            response: err.response,
          });
        },
      }),
    );
  }
}
