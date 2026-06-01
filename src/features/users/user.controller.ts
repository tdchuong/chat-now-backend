import { SearchUsersReqDto } from '@/features/users/use-cases/search-users/dto/search-user.req.dto';
import { SearchUsersUseCase } from '@/features/users/use-cases/search-users/search-user.use-case';
import { Controller, Get, Query } from '@nestjs/common';

@Controller('users')
export class UserController {
  constructor(private readonly searchUsersUseCase: SearchUsersUseCase) {}

  @Get('search')
  async search(@Query() query: SearchUsersReqDto) {
    return this.searchUsersUseCase.execute(query);
  }
}
