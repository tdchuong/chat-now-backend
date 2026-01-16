import { ERROR_CODE } from '@/common/constants/error-codes';
import { NotFoundException } from '@nestjs/common';

export class DeviceNotFoundException extends NotFoundException {
  constructor(message: string = 'Device not found') {
    super({
      message,
      reason: ERROR_CODE.DEVICE_NOT_FOUND,
    });
  }
}

export class DeviceBelongsToAnotherUserException extends NotFoundException {
  constructor(message: string = 'Device does not belong to user') {
    super({
      message,
      reason: ERROR_CODE.DEVICE_FORBIDDEN,
    });
  }
}

export class DeviceInactiveException extends NotFoundException {
  constructor(message: string = 'Device is inactive') {
    super({
      message,
      reason: ERROR_CODE.DEVICE_INACTIVATED,
    });
  }
}
