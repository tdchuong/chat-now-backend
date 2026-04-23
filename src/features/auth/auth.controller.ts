import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RegisterReqDto } from '@/features/auth/register/dto/register-req.dto';
import { RegisterResDto } from '@/features/auth/register/dto/register-res.dto';
import { RegisterUseCase } from '@/features/auth/register/register.use-case';
import { CookieService } from '@/common/cookies/cookie.service';
import { LocalAuthGuard } from '@/common/guards/local-auth.guard';
import { LoginReqDto } from '@/features/auth/login/dto/login.req.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from 'generated/prisma/client';
import { LoginUseCase } from '@/features/auth/login/login.use-case';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly CookieService: CookieService,
  ) {}

  @Put('register')
  async register(@Body() registerDto: RegisterReqDto): Promise<RegisterResDto> {
    return await this.registerUseCase.execute(registerDto);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(
    @Body() dto: LoginReqDto,
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    const {
      token: { refreshToken, accessToken },
      ...rest
    } = await this.loginUseCase.execute(dto, user);

    this.CookieService.setRefreshCookie(res, refreshToken);
    return {
      ...rest,
      accessToken,
    };
  }
}
