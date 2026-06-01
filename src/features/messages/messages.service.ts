import { PrismaService } from '@/database/prisma.service';
import { SendMessageReqDto } from '@/features/messages/use-cases/send-message/dto/send-message.req.dto';
import { Injectable } from '@nestjs/common';
import { MessageAttachment } from 'generated/prisma/client';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}
  // async createMessageWithAttachments(dto: SendMessageReqDto, senderId: string) {
  //   return this.prisma.$transaction(async (tx) => {
  //     // 1. tạo message
  //     const message = await tx.message.create({
  //       data: {
  //         roomId: dto.roomId,
  //         senderId,
  //         content: dto.content,
  //         type: dto.type,
  //         replyToId: dto.replyToId,
  //       },
  //     });

  //     // 2. tạo attachments (nếu có)
  //     let attachments: MessageAttachment[] = [];

  //     if (dto.attachments?.length) {
  //       attachments = await tx.messageAttachment.createManyAndReturn({
  //         data: dto.attachments.map((file) => ({
  //           messageId: message.id,
  //           type: file.type,
  //           fileUrl: file.fileUrl,
  //           fileName: file.fileName,
  //           fileSize: file.fileSize,
  //           duration: file.duration,
  //         })),
  //       });
  //     }

  //     return {
  //       message,
  //       attachments,
  //     };
  //   });
  // }
}
