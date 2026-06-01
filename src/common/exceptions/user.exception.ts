import { ERROR_CODE } from '@/common/constants/error-codes';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * PhoneAlreadyExistsException
 */
export class PhoneAlreadyExistsException extends ConflictException {
  constructor() {
    super({
      errorCode: ERROR_CODE.USER_PHONE_EXISTS,
      message: 'Phone number already exists',
    });
  }
}

/**
 * UserNotFoundException
 */
export class UserNotFoundException extends NotFoundException {
  constructor() {
    super({
      errorCode: ERROR_CODE.USER_NOT_FOUND,
      message: 'Username not found',
    });
  }
}

/**
 * InvalidCredentialsException
 */
export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super({
      errorCode: ERROR_CODE.AUTH_INVALID_CREDENTIALS,
      message: 'Invalid credentials',
    });
  }
}
export class UserIdMissingException extends InternalServerErrorException {
  constructor() {
    super({
      errorCode: ERROR_CODE.USER_ID_MISSING,
      message: 'User id missing',
    }); 
  }
}
