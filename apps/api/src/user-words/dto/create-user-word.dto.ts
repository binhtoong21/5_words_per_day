import { IsNotEmpty, IsString } from 'class-validator';
export class CreateUserWordDto {
  @IsString() @IsNotEmpty() wordId!: string;
}
