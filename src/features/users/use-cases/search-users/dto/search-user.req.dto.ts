import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SearchUsersReqDto {
  @IsString()
  @MaxLength(50)
  q!: string;

  @IsOptional()
  @IsString()
  cursor?: string;
}
