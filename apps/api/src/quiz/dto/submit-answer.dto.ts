import { IsNotEmpty, IsString } from 'class-validator';
export class SubmitAnswerDto {
  @IsString() @IsNotEmpty() quizItemId!: string;
  @IsString() @IsNotEmpty() answer!: string;
}
