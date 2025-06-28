import { BaseSchema } from '@common/base/schemas/mongo/base.schema';
import { IBaseRepository } from '@common/base/repositories/base.repository';
import { BaseServiceInterface } from '@common/base/services/base.interface.service';
import { FindAllResponse } from '@common/types/conmon.type';

export abstract class BaseServiceAbstract<T extends BaseSchema>
  implements BaseServiceInterface<T>
{
  constructor(private readonly repository: IBaseRepository<T>) {}

  async create(createDto: T | any): Promise<T> {
    return await this.repository.create(createDto);
  }

  async softDelete(id: string): Promise<boolean> {
    return this.repository.softDelete(id);
  }
  async permanentlyDelete(id: string): Promise<boolean> {
    return this.repository.permanentlyDelete(id);
  }

  async findAll(
    filter?: object,
    options?: object,
  ): Promise<FindAllResponse<T>> {
    return await this.repository.findAll(filter, options);
  }
  async findOneById(id: string) {
    return await this.repository.findOneById(id);
  }

  async findOneByCondition(options: object, projection?: string) {
    return await this.repository.findOneByCondition(options, projection);
  }

  async update(id: string, updateDto: Partial<T>): Promise<T | null> {
    return await this.repository.update(id, updateDto);
  }

  async remove(id: string): Promise<boolean> {
    return await this.repository.softDelete(id);
  }
}
