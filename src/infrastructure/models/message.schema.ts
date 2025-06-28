import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true })
export class Message {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  sender: mongoose.Types.ObjectId;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
  })
  conversation: mongoose.Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ default: Date.now })
  sentAt: Date;

  // Trường mới cho các loại tin nhắn khác nhau
  @Prop({ default: 'text' })
  messageType: string; // Loại tin nhắn: 'text', 'image', 'video', 'emoji', 'file', etc.

  // Trường lưu trữ hình ảnh, video, emoji, hoặc file
  @Prop({ default: null })
  mediaUrl: string; // URL của hình ảnh/video (dùng cho tin nhắn có media)

  @Prop({ default: null })
  emoji: string; // Emoji nếu tin nhắn chứa emoji (có thể là unicode hoặc tên emoji)

  // Trường lưu trữ các phản ứng của người dùng đối với tin nhắn
  @Prop({
    type: [{ userId: mongoose.Schema.Types.ObjectId, reaction: String }],
  })
  reactions: { userId: mongoose.Types.ObjectId; reaction: string }[]; // Biểu cảm của người dùng (like, love, laugh, v.v.)

  // Trường lưu trữ trả lời tin nhắn (reply to a specific message)
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null })
  replyTo: mongoose.Types.ObjectId; // ID của tin nhắn mà người dùng đang trả lời
}

export const MessageSchema = SchemaFactory.createForClass(Message);
