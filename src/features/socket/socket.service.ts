import { Injectable } from '@nestjs/common';
import { OnGatewayInit } from '@nestjs/websockets';
import { Server } from 'socket.io';

/**
 * Gateway  → nhận event từ client
 * UseCase → xử lý nghiệp vụ
 * SocketService → phát event realtime
 */
@Injectable()
export class SocketService implements OnGatewayInit {
  server!: Server;

  afterInit(server: Server) {
    this.server = server;
  }
  async broadcastToConversation(
    conversationId: string,
    event: string,
    payload: any,
  ) {
    this.server.to(`conversation:${conversationId}`).emit(event, payload);
  }
}
