import { IsArray, IsNotEmpty, IsString } from 'class-validator';
export class GenerateQuizDto {
  @IsArray() words!: any[];
  @IsString() @IsNotEmpty() type!: string;
}
