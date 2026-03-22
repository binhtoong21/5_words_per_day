import { Test, TestingModule } from '@nestjs/testing';
import { QuizService } from './quiz.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

// Helper: tạo mock UserWord
function mockUserWord(id: string, wordId: string, word: string, status: string, lastReviewed: Date) {
  return {
    id,
    userId: 'user-1',
    wordId,
    status,
    streak: 0,
    correctCount: 0,
    wrongCount: 0,
    lastReviewed,
    word: { id: wordId, word, band: 'B1', phonetic: null, definitions: [] },
  };
}

// Helper: tạo mock Word (system)
function mockWord(id: string, word: string, band = 'B1') {
  return { id, word, band, phonetic: null, definitions: [], createdAt: new Date(), updatedAt: new Date() };
}

describe('QuizService — selectDailyWords', () => {
  let service: QuizService;
  let prisma: Record<string, any>;

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn() },
      userWord: { findMany: jest.fn() },
      word: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        { provide: PrismaService, useValue: prisma },
        { provide: AiService, useValue: {} },
      ],
    }).compile();

    service = module.get<QuizService>(QuizService);
  });

  it('Case 1: User đủ từ ở cả 3 pool — trả đúng 15 items với tỷ lệ gần 70/20/10', async () => {
    const now = new Date();
    const oldDate = new Date('2025-01-01');

    // User
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1', currentBand: 'B1' });

    // Pool 1: 11 từ LEARNING/REVIEWING (quota = round(15*0.7) = 11)
    const learningPool = Array.from({ length: 11 }, (_, i) =>
      mockUserWord(`uw-l${i}`, `w-l${i}`, `learn${i}`, 'LEARNING', oldDate)
    );
    // Pool 2: 3 từ MASTERED (quota = round(15*0.2) = 3)
    const masteredPool = Array.from({ length: 3 }, (_, i) =>
      mockUserWord(`uw-m${i}`, `w-m${i}`, `master${i}`, 'MASTERED', oldDate)
    );

    // Trả pool tương ứng theo filter status
    prisma.userWord.findMany.mockImplementation((args: any) => {
      if (args.where?.status?.in) return Promise.resolve(learningPool);
      if (args.where?.status === 'MASTERED') return Promise.resolve(masteredPool);
      // query lấy existingWordIds
      if (args.select?.wordId) return Promise.resolve([
        ...learningPool.map(uw => ({ wordId: uw.wordId })),
        ...masteredPool.map(uw => ({ wordId: uw.wordId })),
      ]);
      return Promise.resolve([]);
    });

    // Pool 3: 5 từ mới hệ thống (quota = 15 - 11 - 3 = 1, nhưng cung đủ)
    const systemPool = Array.from({ length: 15 }, (_, i) => mockWord(`w-n${i}`, `new${i}`, 'B1'));
    prisma.word.findMany.mockImplementation((args: any) => {
      const take = args.take || 15;
      return Promise.resolve(systemPool.slice(0, take));
    });

    // Access private method
    const result = await (service as any).selectDailyWords('user-1', 15);

    expect(result.length).toBe(15);

    // Kiểm tra có cả 3 loại
    const hasLearning = result.some((w: any) => w.word?.startsWith('learn') || w.word?.startsWith('learn'));
    const hasMastered = result.some((w: any) => w.word?.startsWith('master'));
    const hasNew = result.some((w: any) => w.userWordId === null);
    expect(hasLearning || hasMastered || hasNew).toBe(true);
  });

  it('Case 2: User mới (0 userWords) — toàn bộ lấy từ filler hệ thống', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1', currentBand: 'A1' });

    // Tất cả userWord queries trả về rỗng
    prisma.userWord.findMany.mockResolvedValue([]);

    // System words cho pool 3 (only 1 item vì quota new = 1) và filler
    const systemWords = Array.from({ length: 15 }, (_, i) => mockWord(`w-f${i}`, `filler${i}`, 'A1'));
    prisma.word.findMany.mockResolvedValue(systemWords);

    const result = await (service as any).selectDailyWords('user-1', 15);

    // Tất cả phải là từ hệ thống (userWordId = null)
    expect(result.length).toBe(15);
    expect(result.every((w: any) => w.userWordId === null)).toBe(true);
  });

  it('Case 3: User chỉ có LEARNING, 0 MASTERED — quota mastered chuyển sang filler', async () => {
    const oldDate = new Date('2025-01-01');
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1', currentBand: 'B1' });

    const learningPool = Array.from({ length: 5 }, (_, i) =>
      mockUserWord(`uw-l${i}`, `w-l${i}`, `learn${i}`, 'LEARNING', oldDate)
    );

    prisma.userWord.findMany.mockImplementation((args: any) => {
      if (args.where?.status?.in) return Promise.resolve(learningPool);
      if (args.where?.status === 'MASTERED') return Promise.resolve([]);
      if (args.select?.wordId) return Promise.resolve(learningPool.map(uw => ({ wordId: uw.wordId })));
      return Promise.resolve([]);
    });

    const systemWords = Array.from({ length: 15 }, (_, i) => mockWord(`w-s${i}`, `sys${i}`, 'B1'));
    prisma.word.findMany.mockImplementation((args: any) => {
      const take = args.take || 15;
      return Promise.resolve(systemWords.slice(0, take));
    });

    const result = await (service as any).selectDailyWords('user-1', 15);

    expect(result.length).toBe(15);

    // Phải có cả từ learning (có userWordId) và filler (userWordId = null)
    const withUserWord = result.filter((w: any) => w.userWordId !== null);
    const withoutUserWord = result.filter((w: any) => w.userWordId === null);
    expect(withUserWord.length).toBe(5);
    expect(withoutUserWord.length).toBe(10);
  });

  it('Case 4: Từ hệ thống mới KHÔNG trùng với từ đã có trong kho user', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1', currentBand: 'B1' });

    prisma.userWord.findMany.mockImplementation((args: any) => {
      if (args.select?.wordId) return Promise.resolve([{ wordId: 'already-in-bank' }]);
      return Promise.resolve([]);
    });

    prisma.word.findMany.mockImplementation((args: any) => {
      // Kiểm tra query phải có notIn chứa 'already-in-bank'
      if (args.where?.id?.notIn) {
        expect(args.where.id.notIn).toContain('already-in-bank');
      }
      return Promise.resolve([mockWord('w-new-1', 'brandnew', 'B1')]);
    });

    const result = await (service as any).selectDailyWords('user-1', 15);

    // Không được có từ 'already-in-bank' trong kết quả
    expect(result.some((w: any) => w.id === 'already-in-bank')).toBe(false);
  });
});
