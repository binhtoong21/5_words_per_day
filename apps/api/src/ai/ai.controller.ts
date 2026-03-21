import { Controller, Post, Body, Request } from '@nestjs/common';
import { AiService } from './ai.service';
import { CheckNoteDto } from './dto/check-note.dto';
import { SuggestNoteDto } from './dto/suggest-note.dto';
import { AskWordDto } from './dto/ask-word.dto';
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { GeneratePassageDto } from './dto/generate-passage.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('check-note')
  async checkNote(@Request() req: any, @Body() dto: CheckNoteDto) {
    return this.aiService.checkNote(req.user?.id || 'mock', dto);
  }

  @Post('suggest-note')
  async suggestNote(@Request() req: any, @Body() dto: SuggestNoteDto) {
    return this.aiService.suggestNote(req.user?.id || 'mock', dto);
  }

  @Post('ask')
  async ask(@Request() req: any, @Body() dto: AskWordDto) {
    return this.aiService.ask(req.user?.id || 'mock', dto);
  }

  @Post('generate-quiz')
  async generateQuiz(@Request() req: any, @Body() dto: GenerateQuizDto) {
    return this.aiService.generateQuiz(req.user?.id || 'mock', dto);
  }

  @Post('generate-passage')
  async generatePassage(@Request() req: any, @Body() dto: GeneratePassageDto) {
    return this.aiService.generatePassage(req.user?.id || 'mock', dto);
  }
}
