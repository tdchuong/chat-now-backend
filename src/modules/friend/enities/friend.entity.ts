import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({
  timestamps: true,
})
export class Friend {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  user1: mongoose.Types.ObjectId; // Người dùng 1

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  user2: mongoose.Types.ObjectId; // Người dùng 2

  @Prop({ default: false })
  isAccepted: boolean; // Trạng thái mối quan hệ bạn bè (đã chấp nhận hay chưa)
}

export const FriendSchema = SchemaFactory.createForClass(Friend);
