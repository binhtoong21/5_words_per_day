import { Controller, Get, Post, Body, Param, Request, UseGuards } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('quizzes')
@UseGuards(JwtAuthGuard)
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  async create(@Request() req: Express.Request & { user: { id: string } }, @Body() dto: CreateQuizDto) {
    return this.quizService.create(req.user.id, dto);
  }

  @Get('history')
  async getHistory(@Request() req: Express.Request & { user: { id: string } }) {
    return this.quizService.getHistory(req.user.id);
  }

  @Get(':id')
  async findOne(@Request() req: Express.Request & { user: { id: string } }, @Param('id') id: string) {
    return this.quizService.findOne(req.user.id, id);
  }

  @Post(':id/answer')
  async submitAnswer(@Request() req: Express.Request & { user: { id: string } }, @Param('id') id: string, @Body() dto: SubmitAnswerDto) {
    return this.quizService.submitAnswer(req.user.id, id, dto);
  }

  @Post(':id/complete')
  async complete(@Request() req: Express.Request & { user: { id: string } }, @Param('id') id: string) {
    return this.quizService.complete(req.user.id, id);
  }
}
