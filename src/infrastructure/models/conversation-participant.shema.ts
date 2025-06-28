import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({
  timestamps: true,
})
export class ConversationParticipant {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
  })
  conversation: mongoose.Types.ObjectId; // ID của cuộc trò chuyện

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  user: mongoose.Types.ObjectId; // ID của người tham gia

  @Prop({ default: false })
  isAdmin: boolean;
}

export const ConversationParticipantSchema = SchemaFactory.createForClass(
  ConversationParticipant,
);
