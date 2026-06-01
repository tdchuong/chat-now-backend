import { PhoneAlreadyExistsException } from '@/common/exceptions/user.exception';
import { hashPassword } from '@/common/utils';
import { RegisterReqDto } from '@/features/auth/use-cases/register/dto/register-req.dto';
import { RegisterResDto } from '@/features/auth/use-cases/register/dto/register-res.dto';
import { UserService } from '@/features/users/user.service';
import { Injectable } from '@nestjs/common';
import { UserCreateInput } from 'generated/prisma/models';
import { ulid } from 'ulid';
@Injectable()
export class RegisterUseCase {
  constructor(private userService: UserService) {}

  async execute(dto: RegisterReqDto): Promise<RegisterResDto> {
    const existingUser = await this.userService.findByPhone(dto.phone);
    if (existingUser) {
      throw new PhoneAlreadyExistsException();
    }
    const user = await this.userService.create(await this.toUserCreateInput(dto));
    return {
      success: true,
      userId: user.id,
    };
  }
  private async toUserCreateInput(dto: RegisterReqDto): Promise<UserCreateInput> {
    const hashedPassword = await hashPassword(dto.password);
    return {
      id: ulid(),
      username: dto.phone,
      displayName: dto.fullName,
      password: hashedPassword,
      phone: dto.phone,
      dateOfBirth: dto.dateOfBirth,
      gender: dto.gender,
    };
  }
}
