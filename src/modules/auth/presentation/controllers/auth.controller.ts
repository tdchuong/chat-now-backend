import { LoginReqDto } from '@modules/auth/application/dto/login.dto';
import { RegisterReqDto } from '@modules/auth/application/dto/register.dto';
import { IAuthService } from '@modules/auth/domain/services/auth.service.interface';
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('IAuthService')
    private readonly authService: IAuthService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginReqDto) {
    return await this.authService.login(loginDto);
  }
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterReqDto) {
    return await this.authService.register(registerDto);
  }
}
