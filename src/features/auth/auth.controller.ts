import { Cookie } from '@/common/decorators/cookie.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { GetIp } from '@/common/decorators/get-ip.decorator';
import { AuthRefreshGuard } from '@/features/auth/guards/jwt-auth.guard';
import { TokenCookieService } from '@/features/auth/services/token-cookie.service';
import { GetMeUseCase } from '@/features/auth/use-cases/get-me/get-me.use-case';
import { LoginReqDto } from '@/features/auth/use-cases/login/dto/login.req.dto';
import { LoginUseCase } from '@/features/auth/use-cases/login/login.use-case';
import { LogoutUseCase } from '@/features/auth/use-cases/logout/logout-use-case';
import { RegisterReqDto } from '@/features/auth/use-cases/register/dto/register-req.dto';
import { RegisterResDto } from '@/features/auth/use-cases/register/dto/register-res.dto';
import { RegisterUseCase } from '@/features/auth/use-cases/register/register.use-case';
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly getMeUseCase: GetMeUseCase,
    private readonly logoutUseCase: LogoutUseCase,

    private readonly cookieService: TokenCookieService,
  ) {}

  @Put('register')
  async register(@Body() registerDto: RegisterReqDto): Promise<RegisterResDto> {
    return await this.registerUseCase.execute(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginReqDto,
    @Res({ passthrough: true }) res: Response,
    @GetIp() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const result = await this.loginUseCase.execute(dto, { ip, userAgent });
    this.cookieService.setAccessToken(res, result.token.accessToken);
    this.cookieService.setRefreshToken(res, result.token.refreshToken);
    return result.user;
  }

  @UseGuards(AuthRefreshGuard)
  @Get('me')
  async me(@CurrentUser('sub') userId: string) {
    return this.getMeUseCase.execute(userId);
  }

  @Post('logout')
  async logout(
    @Cookie('refresh_token')
    refreshToken: string | undefined,
    @Res({ passthrough: true })
    res: Response,
  ) {
    if (refreshToken) {
      await this.logoutUseCase.execute({ refreshToken });
    }
    this.cookieService.clearTokens(res);
    return { message: 'Logged out successfully' };
  }
}
