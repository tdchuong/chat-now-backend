import { ERROR_CODE } from '@/common/constants/error-codes';
import { UnauthorizedException } from '@nestjs/common';

export class TokenInvalidException extends UnauthorizedException {
  constructor(message: string = 'Token is invalid or expired') {
    super({
      code: ERROR_CODE.AUTH_INVALID_CREDENTIALS,
      message,
    });
  }
}
