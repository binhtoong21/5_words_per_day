import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

const mockCreate = jest.fn();

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate
      }
    }
  }));
});

describe('AiService', () => {
  let service: AiService;
  let prisma: Record<string, any>;
  let cache: Record<string, any>;

  beforeEach(async () => {
    prisma = {
      wordNote: { findFirst: jest.fn() },
      word: { findUnique: jest.fn() },
      readingPassage: { create: jest.fn() }
    };

    cache = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: PrismaService, useValue: prisma },
        { provide: CACHE_MANAGER, useValue: cache },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    process.env.AI_API_KEY = 'real-key';
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockCreate.mockReset();
  });

  it('checkNote should return parsed JSON from OpenAI', async () => {
    prisma.wordNote.findFirst.mockResolvedValue({
      title: 'T', content: 'C', userWord: { word: { word: 'test' } }
    });
    
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: '{"ok":true,"feedback":"Good"}' } }]
    });

    const result = await service.checkNote('u1', { noteId: 'n1', userWordId: 'u1' } as any);
    expect(result).toEqual({ ok: true, feedback: 'Good' });
  });

  it('suggestNote should return parsed JSON from OpenAI', async () => {
    prisma.word.findUnique.mockResolvedValue({
      word: 'test', definitions: []
    });
    cache.get.mockResolvedValue(null);
    
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: '{"suggestions":[{"title":"T", "content":"C"}]}' } }]
    });

    const result = await service.suggestNote('u1', { wordId: 'w1' });
    expect(result).toEqual({ suggestions: [{ title: 'T', content: 'C' }] });
  });

  it('ask should return parsed JSON from OpenAI', async () => {
    prisma.word.findUnique.mockResolvedValue({
      word: 'test', definitions: []
    });
    
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: '{"answer":"It is a test"}' } }]
    });

    const result = await service.ask('u1', { wordId: 'w1', question: 'Q?' });
    expect(result).toEqual({ answer: 'It is a test' });
  });
});
