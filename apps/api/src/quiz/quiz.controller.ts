import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  async create(@Request() req: any, @Body() dto: CreateQuizDto) {
    return this.quizService.create(req.user?.id || 'mock', dto);
  }

  @Get('history')
  async getHistory(@Request() req: any) {
    return this.quizService.getHistory(req.user?.id || 'mock');
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.quizService.findOne(req.user?.id || 'mock', id);
  }

  @Post(':id/answer')
  async submitAnswer(@Request() req: any, @Param('id') id: string, @Body() dto: SubmitAnswerDto) {
    return this.quizService.submitAnswer(req.user?.id || 'mock', id, dto);
  }

  @Post(':id/complete')
  async complete(@Request() req: any, @Param('id') id: string) {
    return this.quizService.complete(req.user?.id || 'mock', id);
  }
}
