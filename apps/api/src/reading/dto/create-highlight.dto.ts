import { IsNotEmpty, IsString } from 'class-validator';
export class CreateHighlightDto {
  @IsString() @IsNotEmpty() word!: string;
}
