import { Prisma, PrismaClient } from 'generated/prisma/client';

export abstract class BaseRepository<T> {
  constructor(public model: any) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    return await this.model.create({ data });
  }

  async createMany(data: any[]): Promise<{ count: number }> {
    return await this.model.createMany({
      data,
      skipDuplicates: true,
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: any;
    orderBy?: any;
    include?: any;
    select?: any;
  }): Promise<T[]> {
    const { skip, take, where, orderBy, include, select } = params || {};
    return await this.model.findMany({
      skip,
      take,
      where,
      orderBy,
      include,
      select,
    });
  }

  async findOne(params: {
    where: any;
    include?: any;
    select?: any;
  }): Promise<T | null> {
    const { where, include, select } = params;
    return await this.model.findFirst({
      where,
      include,
      select,
    });
  }

  async findById(id: string | number, include?: any): Promise<T | null> {
    return await this.model.findUnique({
      where: { id },
      include,
    });
  }

  async update(params: { where: any; data: any }): Promise<T> {
    const { where, data } = params;
    return await this.model.update({
      where,
      data,
    });
  }
  async upsert(params: {
    where: Partial<T>;
    update: Partial<T>;
    create: Partial<T>;
  }): Promise<T> {
    return await this.model.upsert({
      where: params.where,
      update: params.update,
      create: params.create,
    });
  }

  async updateMany(params: {
    where: any;
    data: any;
  }): Promise<{ count: number }> {
    const { where, data } = params;
    return await this.model.updateMany({
      where,
      data,
    });
  }

  async delete(where: any): Promise<T> {
    return await this.model.delete({ where });
  }

  async deleteMany(where: any): Promise<{ count: number }> {
    return await this.model.deleteMany({ where });
  }

  async count(where?: any): Promise<number> {
    return await this.model.count({ where });
  }

  async exists(where: any): Promise<boolean> {
    const count = await this.count(where);
    return count > 0;
  }

  async transaction<R>(fn: (tx: PrismaClient) => Promise<R>): Promise<R> {
    return await this.model.$transaction(fn);
  }

  // Utility method for pagination
  async paginate(params: {
    page: number;
    limit: number;
    where?: any;
    orderBy?: any;
    include?: any;
    select?: any;
  }) {
    const { page = 1, limit = 10, where, orderBy, include, select } = params;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.findAll({ skip, take: limit, where, orderBy, include, select }),
      this.count(where),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  // Soft delete support (if your schema has deletedAt field)
  async softDelete(where: any): Promise<T> {
    return await this.model.update({
      where,
      data: { deletedAt: new Date() },
    });
  }

  async restore(where: any): Promise<T> {
    return await this.model.update({
      where,
      data: { deletedAt: null },
    });
  }
}
