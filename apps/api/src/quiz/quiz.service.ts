import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

/** Fisher-Yates (Knuth) shuffle — unbiased O(n) */
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService, private aiService: AiService) {}

  async create(userId: string, dto: CreateQuizDto) {
    if (userId === 'mock') throw new NotFoundException('User not authenticated properly');
    
    let wordsToTest: any[] = [];

    if (dto.type === 'DAILY') {
      wordsToTest = await this.selectDailyWords(userId);
    } else if (dto.type === 'QUICK') {
      const userWords = await this.prisma.userWord.findMany({ where: { userId }, include: { word: true } });
      wordsToTest = shuffleArray(userWords).slice(0, 10).map((uw: any) => ({ ...uw.word, userWordId: uw.id }));
    } else if (dto.type === 'BAND_TEST') {
      const bands = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      for (const band of bands) {
        const bandWords = await this.prisma.word.findMany({ where: { band }, take: 10 });
        wordsToTest.push(...shuffleArray(bandWords).slice(0, 2).map((w: any) => ({ ...w, userWordId: null })));
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

      const bandPassRate = parseFloat(process.env.BAND_PASS_RATE || '0.6');
      const bandOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      let highestBand = 'A1';
      for (const band of bandOrder) {
        const stats = bandStats[band];
        if (stats && stats.total > 0) {
          if (stats.correct / stats.total >= bandPassRate) {
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

  /**
   * Thuật toán trộn từ cho Daily Quiz theo spec:
   *  - 70% từ LEARNING / REVIEWING (ưu tiên từ lâu chưa ôn)
   *  - 20% từ MASTERED đã > 7 ngày chưa ôn
   *  - 10% từ mới từ hệ thống matching currentBand (chưa nằm trong kho user)
   *  - Nếu bất kỳ pool nào thiếu, bù bằng từ hệ thống bất kỳ (filler)
   */
  private async selectDailyWords(userId: string, total = 15): Promise<any[]> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const currentBand = user?.currentBand || 'A1';

    // Tính quota theo tỷ lệ spec
    const learningQuota = Math.round(total * 0.7);
    const masteredQuota = Math.round(total * 0.2);
    const newQuota      = total - learningQuota - masteredQuota;

    // Pool 1: Từ đang học (LEARNING / REVIEWING), ưu tiên lâu chưa ôn
    const learningWords = await this.prisma.userWord.findMany({
      where: { userId, status: { in: ['LEARNING', 'REVIEWING'] } },
      include: { word: true },
      orderBy: { lastReviewed: 'asc' },
      take: learningQuota,
    });

    // Pool 2: Từ MASTERED nhưng chưa ôn > 7 ngày
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const masteredWords = await this.prisma.userWord.findMany({
      where: { userId, status: 'MASTERED', lastReviewed: { lt: sevenDaysAgo } },
      include: { word: true },
      orderBy: { lastReviewed: 'asc' },
      take: masteredQuota,
    });

    // Pool 3: Từ mới từ hệ thống, loại trừ từ đã có trong kho user
    const existingWordIds = (
      await this.prisma.userWord.findMany({
        where: { userId },
        select: { wordId: true },
      })
    ).map((uw: { wordId: string }) => uw.wordId);

    const newSystemWords = await this.prisma.word.findMany({
      where: { band: currentBand, id: { notIn: existingWordIds } },
      take: newQuota,
    });

    // Gom kết quả từ 3 pools
    const result: any[] = [
      ...learningWords.map((uw: any) => ({ ...uw.word, userWordId: uw.id })),
      ...masteredWords.map((uw: any) => ({ ...uw.word, userWordId: uw.id })),
      ...newSystemWords.map((w: any)  => ({ ...w,       userWordId: null })),
    ];

    // Redistribution: nếu thiếu so với total, bổ sung filler từ hệ thống bất kỳ band
    if (result.length < total) {
      const currentIds = result.map((w: any) => w.id);
      const filler = await this.prisma.word.findMany({
        where: { id: { notIn: [...existingWordIds, ...currentIds] } },
        take: total - result.length,
      });
      result.push(...filler.map((w: any) => ({ ...w, userWordId: null })));
    }

    // Xáo trộn thứ tự cuối cùng (Fisher-Yates)
    return shuffleArray(result);
  }

  /** Calculate days since last review */
  private daysSince(date: Date | null): number {
    if (!date) return Infinity;
    return (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
  }

  async updateLearningStatus(userWordId: string, isCorrect: boolean) {
    const userWord = await this.prisma.userWord.findUnique({ where: { id: userWordId } });
    if (!userWord) return;

    const daysSinceReview = this.daysSince(userWord.lastReviewed);

    if (isCorrect) {
      const newStreak = userWord.streak + 1;
      let newStatus = userWord.status as string;

      // Time-based SRS: require minimum intervals for promotion
      if (newStreak >= 3 && userWord.status === 'NEW') {
        newStatus = 'LEARNING';
      }
      if (newStreak >= 5 && userWord.status === 'LEARNING' && daysSinceReview >= 1) {
        newStatus = 'REVIEWING';
      }
      if (newStreak >= 7 && userWord.status === 'REVIEWING' && daysSinceReview >= 3) {
        newStatus = 'MASTERED';
      }

      await this.prisma.userWord.update({
        where: { id: userWordId },
        data: { correctCount: { increment: 1 }, streak: newStreak, status: newStatus as any, lastReviewed: new Date() }
      });
    } else {
      let newStatus = userWord.status as string;

      // Forgiveness buffer: MASTERED words need 2 consecutive wrong answers
      // We track this by checking if streak is already 0 (previous wrong answer)
      if (userWord.status === 'MASTERED') {
        if (userWord.streak === 0) {
          // Second consecutive wrong answer → downgrade
          newStatus = 'REVIEWING';
        }
        // First wrong answer → just reset streak, don't downgrade yet
      } else if (userWord.status === 'REVIEWING') {
        newStatus = 'LEARNING';
      }

      await this.prisma.userWord.update({
        where: { id: userWordId },
        data: { wrongCount: { increment: 1 }, streak: 0, status: newStatus as any, lastReviewed: new Date() }
      });
    }
  }
}
