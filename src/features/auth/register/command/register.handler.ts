import { PhoneAlreadyExistsException } from '@/common/exceptions/user.exception';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterCommand } from 'src/features/auth/register/command/register.command';
import { PrismaService } from '@/database/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterResDto } from 'src/features/auth/register/dto/register-res.dto';
@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
  constructor(private prisma: PrismaService) {}
  async execute(command: RegisterCommand): Promise<RegisterResDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { phone: command.phone },
    });
    if (existingUser) {
      throw new PhoneAlreadyExistsException();
    }
    const hashedPassword = await this.hashPassword(command.password);

    await this.prisma.user.create({
      data: {
        display_name: command.fullName,
        username: command.phone,
        phone: command.phone,
        password: hashedPassword,
        date_of_birth: command.dateOfBirth,
        gender: command.gender,
      },
    });
    return { success: true };
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }
}
