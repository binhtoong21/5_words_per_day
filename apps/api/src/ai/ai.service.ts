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
    
    const client = this.getOpenAI();
    if (!client) return { ok: true, feedback: 'Looks good! (Mock)' };

    const note = await this.prisma.wordNote.findFirst({
      where: { id: dto.noteId, userWordId: dto.userWordId, userWord: { userId } },
      include: { userWord: { include: { word: true } } }
    });
    if (!note) throw new HttpException('Note not found', HttpStatus.NOT_FOUND);

    const prompt = `Evaluate the spelling, grammar, and contextual accuracy of the following custom note for the English word "${note.userWord.word.word}".
Note Title: "${note.title}"
Note Content: "${note.content}"

Output ONLY a JSON object exactly like this:
{ "ok": boolean, "feedback": "string explaining any errors or saying it is perfect" }`;

    try {
      const response = await client.chat.completions.create({
        model: process.env.AI_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      });
      let rawJson = response.choices[0].message.content || '{"ok":true,"feedback":"Error parsing."}';
      rawJson = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(rawJson);
    } catch (e) {
      console.error('AI checkNote Error:', e);
      return { ok: true, feedback: 'Validation service temporarily unavailable.' };
    }
  }

  async suggestNote(userId: string, dto: SuggestNoteDto) {
    await this.enforceRateLimit(userId, 'suggestNote', 30);
    const cacheKey = `suggest-note:${dto.wordId}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;
    
    const client = this.getOpenAI();
    if (!client) {
      const result = { suggestions: [{ title: 'Context (Mock)', content: 'Used in this way.' }] };
      await this.cacheManager.set(cacheKey, result, 604800000);
      return result;
    }

    const word = await this.prisma.word.findUnique({ where: { id: dto.wordId } });
    if (!word) throw new HttpException('Word not found', HttpStatus.NOT_FOUND);

    const prompt = `Generate 2 to 3 creative note suggestions for someone learning the English word "${word.word}".
The word details are: ${JSON.stringify(word.definitions)}

Ensure the suggestions show how to use the word in different contexts or mnemonics.
Output ONLY a JSON object exactly like this:
{ "suggestions": [ { "title": "short string", "content": "longer string" } ] }`;

    try {
      const response = await client.chat.completions.create({
        model: process.env.AI_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      });
      let rawJson = response.choices[0].message.content || '{"suggestions":[]}';
      rawJson = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
      const result = JSON.parse(rawJson);
      if (result && result.suggestions) {
        await this.cacheManager.set(cacheKey, result, 604800000);
      }
      return result;
    } catch (e) {
      console.error('AI suggestNote Error:', e);
      throw new HttpException('AI Generation Failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async ask(userId: string, dto: AskWordDto) {
    await this.enforceRateLimit(userId, 'ask', 20);
    
    const client = this.getOpenAI();
    if (!client) return { answer: 'AI answer restricted to vocab context. (Mock)' };

    const word = await this.prisma.word.findUnique({ where: { id: dto.wordId } });
    if (!word) throw new HttpException('Word not found', HttpStatus.NOT_FOUND);

    const prompt = `You are a helpful English tutor. The user is asking a question about the English word "${word.word}".
The dictionary definition for context is: ${JSON.stringify(word.definitions)}

User's Question: "${dto.question}"

Rules:
1. Only answer questions related to the word, English grammar, or language learning.
2. If the user asks something completely unrelated, politely decline and refocus them on language learning.
3. Be concise and friendly.
4. Output ONLY a JSON object exactly like this: { "answer": "your answer here" }`;

    try {
      const response = await client.chat.completions.create({
        model: process.env.AI_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5
      });
      let rawJson = response.choices[0].message.content || '{"answer":"Error generating response."}';
      rawJson = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(rawJson);
    } catch (e) {
      console.error('AI ask Error:', e);
      throw new HttpException('AI Generation Failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
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
         temperature: 0.7,
         response_format: { type: 'json_object' }
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

    const prompt = `You are an expert English teacher. Write an engaging B1/B2 level short story about "${(dto as any).topic || 'a random interesting adventure'}". The story should be 3-4 paragraphs long. Use natural, authentic English. 
Output ONLY a JSON object exactly like this:
{ "title": "A catchy title for the story", "content": "The 3-4 paragraph story text" }`;

    try {
      const response = await client.chat.completions.create({
         model: process.env.AI_MODEL || 'gpt-4o-mini',
         messages: [{ role: 'user', content: prompt }],
         temperature: 0.7,
         response_format: { type: 'json_object' }
      });

      let rawJson = response.choices[0].message.content || '{"title":"Error", "content":"Generation failed."}';
      rawJson = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(rawJson);
      
      return await this.prisma.readingPassage.create({
        data: { userId, title: parsed.title || 'Daily Reading Practice', content: parsed.content || 'Error' }
      });
    } catch (e) {
      console.error('AI Passage Error:', e);
      throw new HttpException('Passage Generation Failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
