import { ERROR_CODE } from '@/common/constants/error-codes';
import { UnauthorizedException } from '@nestjs/common';

export class TokenInvalidException extends UnauthorizedException {
  constructor() {
    super({
      errorCode: ERROR_CODE.AUTH_INVALID_CREDENTIALS,
      message: 'Token is invalid or expired',
    });
  }
}
