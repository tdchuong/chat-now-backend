import { Command } from '@nestjs/cqrs';
import { Gender } from 'generated/prisma/enums';
import { RegisterReqDto } from 'src/features/auth/register/dto/register-req.dto';

export class RegisterCommand extends Command<any> {
  constructor(
    public readonly fullName: string,
    public readonly phone: string,
    public readonly password: string,
    public readonly dateOfBirth: Date,
    public readonly gender: Gender,
  ) {
    super();
  }

  static from(dto: RegisterReqDto): RegisterCommand {
    return new RegisterCommand(
      dto.fullName,
      dto.phone,
      dto.password,
      new Date(dto.dateOfBirth),
      dto.gender,
    );
  }
}
