import { IsArray, IsString } from 'class-validator';
export class GeneratePassageDto {
  @IsArray() @IsString({ each: true }) words!: string[];
}
