import { ERROR_CODE } from '@/common/constants/error-codes';
import { UnauthorizedException } from '@nestjs/common';

export class AuthUnauthorizedException extends UnauthorizedException {
  constructor() {
    super({
      message: 'Unauthorized',
      errorCode: ERROR_CODE.AUTH_UNAUTHORIZED,
    });
  }
}
