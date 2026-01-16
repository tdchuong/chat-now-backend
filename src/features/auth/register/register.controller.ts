import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterCommand } from 'src/features/auth/register/command/register.command';
import { RegisterReqDto } from 'src/features/auth/register/dto/register-req.dto';
import { RegisterResDto } from 'src/features/auth/register/dto/register-res.dto';

@Controller('auth')
export class RegisterController {
  constructor(private commandbus: CommandBus) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterReqDto): Promise<RegisterResDto> {
    return await this.commandbus.execute(RegisterCommand.from(registerDto));
  }
}
