import { IsNotEmpty, IsString } from 'class-validator';
export class SuggestNoteDto {
  @IsString() @IsNotEmpty() wordId!: string;
}
