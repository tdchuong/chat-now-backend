import {
  Document,
  Model,
  FilterQuery,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
} from 'mongoose';
import { FindAllResponse } from '@common/types/conmon.type';
import { BaseSchema } from '@common/base/schemas/mongo/base.schema';
import { UserEntity } from '@modules/user/domain/entities/user.entity';

// Thêm generic type cho schema (S)
// và entity (T)
export abstract class BaseRepositoryAbstract<
  S extends Document & BaseSchema, // S là schema Mongoose mở rộng từ Document và BaseSchema
  T,
> {
  constructor(
    protected readonly model: Model<S>, // Model làm việc với schema
    private readonly toEntity: (document: S) => T, // Hàm mapping từ schema sang entity
    private readonly toDocument: (entity: T) => Partial<S>, // Hàm mapping từ entity sang schema
  ) {}

  async create(dto: Partial<T>): Promise<T> {
    const document = new this.model(this.toDocument(dto as T));
    console.log('Document to save:', document);
    
    const saved = await this.model.create(document);
    return this.toEntity(saved);
  }

  async findOneById(
    id: string,
    projection?: ProjectionType<S>,
  ): Promise<T | null> {
    const document = await this.model.findById(id, projection).exec();
    return document && !document.deletedAt ? this.toEntity(document) : null;
  }

  async findOneByCondition(
    condition: FilterQuery<S> = {},
    projection?: string,
  ): Promise<T | null> {
    const document = await this.model
      .findOne({ ...condition, deletedAt: null }, projection)
      .exec();
    if (!document) {
      return null;
    }

    console.log(' toEntity>>>>', this.toEntity(document));
    
    return this.toEntity(document);
    // return document ? this.toEntity(document) : null;
  }

  async findAll(
    condition: FilterQuery<S> = {},
    options: QueryOptions<S> = {},
  ): Promise<FindAllResponse<T>> {
    const queryCondition = { ...condition, deleted_at: null };
    const [total, data] = await Promise.all([
      this.model.countDocuments(queryCondition),
      this.model.find(queryCondition, options.projection, options).exec(),
    ]);

    return {
      data: data.map((doc) => this.toEntity(doc)),
      total,
      page: options.skip
        ? Math.floor(
            (options.skip as number) / ((options.limit as number) || 1),
          ) + 1
        : 1,
      limit: options.limit ?? data.length,
    };
  }

  async update(id: string, dto: Partial<T>): Promise<T | null> {
    const document = await this.model
      .findOneAndUpdate(
        { _id: id, deletedAt: null },
        this.toDocument(dto as T) as UpdateQuery<S>,
        {
          new: true,
        },
      )
      .exec();
    return document ? this.toEntity(document) : null;
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.model
      .findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true })
      .exec();
    return !!result;
  }

  async permanentlyDelete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }
}
