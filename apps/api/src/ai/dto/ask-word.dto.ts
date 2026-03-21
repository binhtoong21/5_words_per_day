import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
export class AskWordDto {
  @IsString() @IsNotEmpty() wordId!: string;
  @IsString() @IsNotEmpty() @MaxLength(200) question!: string;
}
