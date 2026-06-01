import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma.service';
import { SearchUsersReqDto } from '@/features/users/use-cases/search-users/dto/search-user.req.dto';

@Injectable()
export class SearchUsersUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: SearchUsersReqDto) {
    const limit = 10;

    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { displayName: { contains: dto.q, mode: 'insensitive' } },
          { phone: { contains: dto.q, mode: 'insensitive' } },
        ],
      },
      take: limit + 1, // Lấy thêm 1 để kiểm tra "còn dữ liệu không"
      cursor: dto.cursor ? { id: dto.cursor } : undefined,
      skip: dto.cursor ? 1 : 0, // Bỏ qua bản ghi hiện tại khi dùng cursor
      orderBy: { id: 'desc' }, // Sắp xếp giảm dần theo id

      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
      },
    });

    const hasMore = users.length > limit;
    const data = hasMore ? users.slice(0, limit) : users;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return {
      data,
      pagination: {
        nextCursor,
        hasMore,
      },
    };
  }
}
