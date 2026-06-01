import { WsJwtGuard } from '@/features/socket/guards/ws-jwt.guard';
import { SendMessageReqDto } from '@/features/messages/use-cases/send-message/dto/send-message.req.dto';
import { SendMessageUseCase } from '@/features/messages/use-cases/send-message/send-message.use-case';
import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

/**
 * Gateway  → nhận event từ client
 * UseCase → xử lý nghiệp vụ
 * SocketService → phát event realtime
 */
@WebSocketGateway({ namespace: '/chat', cors: true })
export class MessagesGateway {
  constructor(private readonly sendMessageUseCase: SendMessageUseCase) {}

  // @UseGuards(WsJwtGuard)
  // @SubscribeMessage('send_message')
  // async handleSendMessage(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() dto: SendMessageReqDto,
  // ) {
  //   const userId = client.data.userId;
  //   // const result = await this.sendMessageUseCase.execute(dto, userId);
  //   return { event: 'message_confirmed', data: result };
  // }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join_conversation')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { conversationId: string },
  ) {
    await client.join(`conversation:${body.conversationId}`);
    return { event: 'joined', data: { conversationId: body.conversationId } };
  }
}
