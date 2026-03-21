import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService, private aiService: AiService) {}

  async create(userId: string, dto: CreateQuizDto) {
    if (userId === 'mock') throw new NotFoundException('User not authenticated properly');
    
    let wordsToTest: any[] = [];

    if (dto.type === 'DAILY') {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      
      const learningWords = await this.prisma.userWord.findMany({
        where: { userId, status: { in: ['LEARNING', 'REVIEWING'] } },
        include: { word: true },
        take: 20
      });

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const masteredWords = await this.prisma.userWord.findMany({
        where: { userId, status: 'MASTERED', lastReviewed: { lt: sevenDaysAgo } },
        include: { word: true },
        take: 10
      });
      
      const userWordIds = (await this.prisma.userWord.findMany({ where: { userId }, select: { wordId: true } })).map(uw => uw.wordId);
      const newSystemWords = await this.prisma.word.findMany({
        where: { band: user?.currentBand || 'A1', id: { notIn: userWordIds } },
        take: 20
      });

      const shuffle = (arr: any[]) => arr.sort(() => 0.5 - Math.random());
      
      let remaining = 10;
      
      const p1 = shuffle(learningWords).slice(0, 7).map((uw: any) => ({ ...uw.word, userWordId: uw.id }));
      remaining -= p1.length;
      
      const p2 = shuffle(masteredWords).slice(0, Math.min(2, remaining)).map((uw: any) => ({ ...uw.word, userWordId: uw.id }));
      remaining -= p2.length;
      
      const p3 = shuffle(newSystemWords).slice(0, remaining).map((w: any) => ({ ...w, userWordId: null }));
      
      wordsToTest = [...p1, ...p2, ...p3];
    } else if (dto.type === 'QUICK') {
      const userWords = await this.prisma.userWord.findMany({ where: { userId }, include: { word: true } });
      wordsToTest = userWords.sort(() => 0.5 - Math.random()).slice(0, 10).map((uw: any) => ({ ...uw.word, userWordId: uw.id }));
    } else if (dto.type === 'BAND_TEST') {
      const bands = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      for (const band of bands) {
        const bandWords = await this.prisma.word.findMany({ where: { band }, take: 10 });
        wordsToTest.push(...bandWords.sort(() => 0.5 - Math.random()).slice(0, 2).map((w: any) => ({ ...w, userWordId: null })));
      }
    }

    // Ensure at least 5 questions
    if (wordsToTest.length < 5) {
       const userWordIds = wordsToTest.map(w => w.id).filter(Boolean);
       const fallbackWords = await this.prisma.word.findMany({ 
         where: { id: { notIn: userWordIds } },
         take: 10 - wordsToTest.length 
       });
       wordsToTest.push(...fallbackWords.map((w: any) => ({ ...w, userWordId: null })));
    }

    const generatedItems = await this.aiService.generateQuiz(userId, { type: dto.type, words: wordsToTest });

    const quiz = await this.prisma.quiz.create({
      data: {
        userId,
        type: dto.type as any,
        items: {
          create: generatedItems.map((item: any) => ({
            wordId: item.wordId,
            userWordId: item.userWordId,
            questionType: item.questionType,
            questionText: item.questionText,
            options: item.options,
            correctAnswer: item.correctAnswer
          }))
        }
      }
    });
    return quiz;
  }

  async getHistory(userId: string) {
    return this.prisma.quiz.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(userId: string, id: string) {
    const quiz = await this.prisma.quiz.findFirst({ where: { id, userId }, include: { items: true } });
    if (!quiz) throw new NotFoundException();
    return quiz;
  }

  async submitAnswer(userId: string, quizId: string, dto: SubmitAnswerDto) {
    const item = await this.prisma.quizItem.findFirst({ where: { id: dto.quizItemId, quizId, quiz: { userId } }});
    if (!item) throw new NotFoundException();
    
    const isCorrect = item.correctAnswer === dto.answer;
    
    await this.prisma.quizItem.update({
      where: { id: item.id },
      data: { userAnswer: dto.answer, isCorrect }
    });

    if (item.userWordId) {
       await this.updateLearningStatus(item.userWordId, isCorrect);
    }

    return { isCorrect, correctAnswer: item.correctAnswer };
  }

  async complete(userId: string, quizId: string) {
    const quiz = await this.prisma.quiz.findFirst({ where: { id: quizId, userId }, include: { items: true } });
    if (!quiz) throw new NotFoundException();
    
    const correctCount = quiz.items.filter((i: any) => i.isCorrect).length;
    const score = quiz.items.length > 0 ? (correctCount / quiz.items.length) * 100 : 0;

    if (quiz.type === 'BAND_TEST') {
      const items = quiz.items;
      const wordIds = items.map((i: any) => i.wordId).filter(Boolean) as string[];
      
      const words = await this.prisma.word.findMany({
        where: { id: { in: wordIds } }
      });
      
      const wordBandMap = new Map<string, string>();
      for (const w of words) wordBandMap.set(w.id, w.band);

      const bandStats: Record<string, { total: number, correct: number }> = {};
      
      for (const item of items) {
         if (!item.wordId) continue;
         const band = wordBandMap.get(item.wordId);
         if (!band) continue;
         
         if (!bandStats[band]) bandStats[band] = { total: 0, correct: 0 };
         bandStats[band].total++;
         if (item.isCorrect) bandStats[band].correct++;
      }

      const bandOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      let highestBand = 'A1';
      for (const band of bandOrder) {
        const stats = bandStats[band];
        if (stats && stats.total > 0) {
          if (stats.correct / stats.total >= 0.6) {
             highestBand = band;
          }
        }
      }

      await this.prisma.user.update({
        where: { id: userId },
        data: { currentBand: highestBand }
      });
    }

    return this.prisma.quiz.update({
      where: { id: quizId },
      data: { status: 'COMPLETED', completedAt: new Date(), score }
    });
  }

  async updateLearningStatus(userWordId: string, isCorrect: boolean) {
    const userWord = await this.prisma.userWord.findUnique({ where: { id: userWordId } });
    if (!userWord) return;

    if (isCorrect) {
      const newStreak = userWord.streak + 1;
      let newStatus = userWord.status as any;

      if (newStreak >= 3 && userWord.status === 'NEW') newStatus = 'LEARNING';
      if (newStreak >= 5 && userWord.status === 'LEARNING') newStatus = 'REVIEWING';
      if (newStreak >= 7 && userWord.status === 'REVIEWING') newStatus = 'MASTERED';

      await this.prisma.userWord.update({
        where: { id: userWordId },
        data: { correctCount: { increment: 1 }, streak: newStreak, status: newStatus, lastReviewed: new Date() }
      });
    } else {
      let newStatus = userWord.status as any;
      if (userWord.status === 'MASTERED') newStatus = 'REVIEWING';
      else if (userWord.status === 'REVIEWING') newStatus = 'LEARNING';

      await this.prisma.userWord.update({
        where: { id: userWordId },
        data: { wrongCount: { increment: 1 }, streak: 0, status: newStatus, lastReviewed: new Date() }
      });
    }
  }
}
