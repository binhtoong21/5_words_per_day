import { IsEnum, IsNotEmpty } from 'class-validator';
enum QuizType { DAILY = 'DAILY', QUICK = 'QUICK', BAND_TEST = 'BAND_TEST', CUSTOM = 'CUSTOM' };
export class CreateQuizDto {
  @IsEnum(QuizType) @IsNotEmpty() type!: QuizType;
}
