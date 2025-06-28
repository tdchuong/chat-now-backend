export interface FindAllResponse<T> {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
}

export type Projection<T> = Partial<Record<keyof T, boolean>>;

export type MongoQuery<T> = Partial<T> | { [key: string]: any };
