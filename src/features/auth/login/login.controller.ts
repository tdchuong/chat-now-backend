import { CookieService } from '@/common/cookies/cookie.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { LocalAuthGuard } from '@/common/guards/local-auth.guard';
import { LoginCommand } from '@/features/auth/login/commands/login.command';
import { LoginReqDto } from '@/features/auth/login/dto/login.req.dto';
import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { User } from 'generated/prisma/client';

@Controller('auth')
export class LoginController {
  constructor(
    private commandbus: CommandBus,
    private readonly CookieService: CookieService,
  ) {}
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
    } = await this.commandbus.execute(LoginCommand.from(dto, user));

    this.CookieService.setRefreshCookie(res, refreshToken);
    return {
      ...rest,
      accessToken,
    };
  }
}
