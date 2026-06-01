import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();

    try {
      // Lấy token từ handshake headers
      const authHeader = client.handshake.headers.authorization;

      if (!authHeader) {
        throw new UnauthorizedException('Missing authorization header');
      }

      // Bearer token
      const token = authHeader.split(' ')[1];

      if (!token) {
        throw new UnauthorizedException('Missing token');
      }

      // Verify token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      // Gắn thông tin user vào socket
      client.data.userId = payload.sub;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
