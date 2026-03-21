import { IsOptional, IsString } from 'class-validator';

export class QueryWordsDto {
  @IsOptional() @IsString() band?: string;
  @IsOptional() @IsString() page?: string;
  @IsOptional() @IsString() limit?: string;
  @IsOptional() @IsString() q?: string;
}
