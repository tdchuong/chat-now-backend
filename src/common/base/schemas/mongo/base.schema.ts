import { Prop } from '@nestjs/mongoose';

export class BaseSchema {
  _id?: string; // Sau này sẽ dùng với class-transformer để serialize dữ liệu response

  @Prop({ default: null })
  deletedAt: Date; // Dùng cho soft delete

  @Prop({ default: Date.now })
  createdAt: Date; // Ngày tạo bản ghi

  @Prop({ default: Date.now })
  updatedAt: Date; // Ngày cập nhật bản ghi
}
