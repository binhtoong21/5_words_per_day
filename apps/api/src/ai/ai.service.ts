import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';
import { CheckNoteDto } from './dto/check-note.dto';
import { SuggestNoteDto } from './dto/suggest-note.dto';
import { AskWordDto } from './dto/ask-word.dto';
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { GeneratePassageDto } from './dto/generate-passage.dto';

@Injectable()
export class AiService {
  private openai: OpenAI | null = null;

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  private getOpenAI() {
    const key = process.env.AI_API_KEY;
    if (key && key !== 'sk-mock-key') {
      return new OpenAI({
        apiKey: key.replace(/['"]/g, ''),
        baseURL: process.env.AI_BASE_URL?.replace(/['"]/g, '').replace(/\/+$/, '') || undefined
      });
    }
    return null;
  }

  private async enforceRateLimit(userId: string, endpoint: string, limit: number) {
    const key = `ai_limit:${userId}:${endpoint}`;
    let count = (await this.cacheManager.get<number>(key)) || 0;
    
    if (count >= limit) {
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }
    
    await this.cacheManager.set(key, count + 1, 86400000); // 24h caching
  }

  async checkNote(userId: string, dto: CheckNoteDto) {
    await this.enforceRateLimit(userId, 'checkNote', 30);
    return { ok: true, feedback: 'Looks good!' };
  }

  async suggestNote(userId: string, dto: SuggestNoteDto) {
    await this.enforceRateLimit(userId, 'suggestNote', 30);
    const cached = await this.cacheManager.get(`suggest-note:${dto.wordId}`);
    if (cached) return cached;
    
    const result = { suggestions: [{ title: 'Context', content: 'Used in this way.' }] };
    await this.cacheManager.set(`suggest-note:${dto.wordId}`, result, 604800000);
    return result;
  }

  async ask(userId: string, dto: AskWordDto) {
    await this.enforceRateLimit(userId, 'ask', 20);
    return { answer: 'AI answer restricted to vocab context.' };
  }

  async generateQuiz(userId: string, dto: GenerateQuizDto) {
    await this.enforceRateLimit(userId, 'generateQuiz', 500);
    
    const client = this.getOpenAI();
    if (!client || !dto.words || dto.words.length === 0) {
      return (dto.words || []).map(w => ({
        wordId: w.id,
        userWordId: w.userWordId,
        questionType: 'MULTIPLE_CHOICE',
        questionText: `Mock Question: What does "${w.word}" mean?`,
        options: ['Correct Meaning', 'Random Option A', 'Random Option B', 'Random Option C'],
        correctAnswer: 'Correct Meaning'
      }));
    }

    const prompt = `You are an expert English teacher. Create exactly one multiple-choice question for EACH of the following words.
Target Words:
${JSON.stringify(dto.words.map(w => ({ id: w.id, userWordId: w.userWordId, word: w.word, definitions: w.definitions })))}

Rules:
- The question should test the meaning, usage, or context of the word.
- Output ONLY a JSON object containing a "questions" array.
- Each question must have: wordId, userWordId, questionType ("MULTIPLE_CHOICE"), questionText, options (array of 4 strings), correctAnswer (exactly matching one of the options).
`;

    try {
      const response = await client.chat.completions.create({
         model: process.env.AI_MODEL || 'gpt-4o-mini',
         messages: [{ role: 'user', content: prompt }],
         temperature: 0.7
      });

      let rawJson = response.choices[0].message.content || '{"questions":[]}';
      rawJson = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
      const result = JSON.parse(rawJson);
      return result.questions || [];
    } catch (e) {
      console.error('AI Error:', e);
      throw new HttpException('AI Generation Failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async generatePassage(userId: string, dto: GeneratePassageDto) {
    await this.enforceRateLimit(userId, 'generatePassage', 3);
    
    const client = this.getOpenAI();
    if (!client) {
      return await this.prisma.readingPassage.create({
        data: { userId, title: 'A New Journey', content: 'This is an AI generated passage (Mock mode).' }
      });
    }

    const prompt = `You are an expert English teacher. Write an engaging B1/B2 level short story about "${(dto as any).topic || 'a random interesting adventure'}". The story should be 3-4 paragraphs long. Use natural, authentic English. Do not include markdown formatting or titles in the output, just the raw text of the story.`;

    try {
      const response = await client.chat.completions.create({
         model: process.env.AI_MODEL || 'gpt-4o-mini',
         messages: [{ role: 'user', content: prompt }],
         temperature: 0.7
      });

      const text = response.choices[0].message.content || 'Generated story error.';
      
      return await this.prisma.readingPassage.create({
        data: { userId, title: (dto as any).topic ? `Reading: ${(dto as any).topic}` : 'Daily Reading Practice', content: text }
      });
    } catch (e) {
      console.error('AI Passage Error:', e);
      throw new HttpException('Passage Generation Failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
