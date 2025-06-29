import { BaseSchema } from '@common/base/schemas/mongo/base.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type UserDocument = mongoose.HydratedDocument<User>;
@Schema({
  timestamps: true,
})
export class User extends BaseSchema {
  @Prop({ required: true })
  fullName: string;

  @Prop({
    required: true,
    unique: true,
  })
  email: string;

  @Prop({
    required: true,
  })
  password: string;

  @Prop({
    default:
      'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png',
  })
  avatar: string;

  @Prop()
  dateOfBirth: Date;

  @Prop({
    default: 'offline',
    enum: ['online', 'offline'],
  })
  status: string;

  @Prop({ default: 0 })
  point: number;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User' })
  friends: mongoose.Types.ObjectId[]; // Quan hệ bạn bè (array các UserId)
}

export const UserSchema = SchemaFactory.createForClass(User);
