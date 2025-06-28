import { FindAllResponse } from '@common/types/conmon.type';

export interface IBaseRepository<T> {
  /**
   * Tạo một entity mới
   */
  create(dto: Partial<T>): Promise<T>;

  /**
   * Tìm một bản ghi theo ID. Có thể trả về null nếu không tìm thấy.
   */
  findOneById(id: string, projection?: string): Promise<T | null>;

  /**
   * Tìm một bản ghi theo điều kiện. Có thể trả về null nếu không tìm thấy.
   */
  findOneByCondition(condition: object, projection?: string): Promise<T | null>;

  /**
   * Lấy danh sách các bản ghi theo điều kiện, có hỗ trợ options (limit, sort, skip, etc.)
   */
  findAll(condition?: object, options?: object): Promise<FindAllResponse<T>>;

  /**
   * Cập nhật bản ghi theo ID. Có thể throw lỗi nếu không tìm thấy (nên xử lý ở service).
   */
  update(id: string, dto: Partial<T>): Promise<T | null>;

  /**
   * Xoá mềm - đánh dấu là đã xoá, nhưng không xoá khỏi DB.
   */
  softDelete(id: string): Promise<boolean>;

  /**
   * Xoá vĩnh viễn bản ghi.
   */
  permanentlyDelete(id: string): Promise<boolean>;
}
