import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { CheckNoteDto } from './dto/check-note.dto';
import { SuggestNoteDto } from './dto/suggest-note.dto';
import { AskWordDto } from './dto/ask-word.dto';
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { GeneratePassageDto } from './dto/generate-passage.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('check-note')
  async checkNote(@Request() req: Express.Request & { user: { id: string } }, @Body() dto: CheckNoteDto) {
    return this.aiService.checkNote(req.user.id, dto);
  }

  @Post('suggest-note')
  async suggestNote(@Request() req: Express.Request & { user: { id: string } }, @Body() dto: SuggestNoteDto) {
    return this.aiService.suggestNote(req.user.id, dto);
  }

  @Post('ask')
  async ask(@Request() req: Express.Request & { user: { id: string } }, @Body() dto: AskWordDto) {
    return this.aiService.ask(req.user.id, dto);
  }

  @Post('generate-quiz')
  async generateQuiz(@Request() req: Express.Request & { user: { id: string } }, @Body() dto: GenerateQuizDto) {
    return this.aiService.generateQuiz(req.user.id, dto);
  }

  @Post('generate-passage')
  async generatePassage(@Request() req: Express.Request & { user: { id: string } }, @Body() dto: GeneratePassageDto) {
    return this.aiService.generatePassage(req.user.id, dto);
  }
}
