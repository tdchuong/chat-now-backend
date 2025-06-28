import { ConversationType } from '@modules/conversation/enums/conversation-type.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({
  timestamps: true,
})
export class Conversation {
  @Prop({ required: true })
  name: string; // Tên cuộc trò chuyện

  @Prop({ required: true })
  type: ConversationType; // Loại cuộc trò chuyện (group/chat cá nhân)

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    required: true,
  })
  participants: mongoose.Types.ObjectId[]; // Người tham gia cuộc trò chuyện (array các UserId)

  @Prop({ default: null })
  lastMessage: string; // Tin nhắn cuối cùng (Optional)

  @Prop({ default: Date.now })
  lastMessageAt: Date; // Thời gian gửi tin nhắn cuối cùng
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
