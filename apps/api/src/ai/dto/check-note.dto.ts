import { IsNotEmpty, IsString } from 'class-validator';
export class CheckNoteDto {
  @IsString() @IsNotEmpty() userWordId!: string;
  @IsString() @IsNotEmpty() noteId!: string;
}
