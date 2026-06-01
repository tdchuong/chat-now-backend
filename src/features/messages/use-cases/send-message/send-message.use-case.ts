import { MessagesService } from '@/features/messages/messages.service';
import { SendMessageReqDto } from '@/features/messages/use-cases/send-message/dto/send-message.req.dto';
import { SocketService } from '@/features/socket/socket.service';
import { Injectable } from '@nestjs/common';
import { Message, MessageAttachment } from 'generated/prisma/client';

@Injectable()
export class SendMessageUseCase {
  constructor(
    private readonly messagesService: MessagesService,
    // private readonly roomsSerivice: RoomsService,
    private readonly socketService: SocketService,
  ) {}
  // async execute(dto: SendMessageReqDto, senderId: string) {
  //   // await this.roomsSerivice.assertMember(dto.roomId, senderId);

  //   const result = await this.messagesService.createMessageWithAttachments(
  //     dto,
  //     senderId,
  //   );

  //   const payload = {
  //     id: result.message.id,
  //     roomId: result.message.roomId,
  //     senderId: result.message.senderId,
  //     content: result.message.content,
  //     type: result.message.type,
  //     attachments: result.attachments,
  //     createdAt: result.message.createdAt,
  //   };

  //   await this.socketService.broadcastToConversation(
  //     dto.roomId,
  //     'new_message',
  //     payload,
  //   );

  //   return payload;
  // }
}
