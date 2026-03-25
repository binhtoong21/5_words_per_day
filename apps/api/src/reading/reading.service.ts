import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { CreateHighlightDto } from './dto/create-highlight.dto';

@Injectable()
export class ReadingService {
  constructor(private prisma: PrismaService, private aiService: AiService) {}

  async findAll(userId: string) {
    return this.prisma.readingPassage.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async create(userId: string, dto?: any) {
    return this.aiService.generatePassage(userId, dto || {});
  }

  async findOne(userId: string, id: string) {
    const passage = await this.prisma.readingPassage.findFirst({
      where: { id, userId },
      include: { highlights: true, passageWords: true }
    });
    if (!passage) throw new NotFoundException();
    return passage;
  }

  async highlight(userId: string, passageId: string, dto: CreateHighlightDto) {
    const passage = await this.prisma.readingPassage.findFirst({ where: { id: passageId, userId }});
    if (!passage) throw new NotFoundException();
    
    return this.prisma.passageHighlight.create({
      data: { passageId, wordText: dto.word }
    });
  }

  async addToBank(userId: string, passageId: string, highlightId: string) {
    const hl = await this.prisma.passageHighlight.findFirst({ where: { id: highlightId, passage: { userId } }});
    if (!hl) throw new NotFoundException('Highlight not found');

    // Look up the word in the system dictionary by highlighted text
    const word = await this.prisma.word.findFirst({
      where: { word: { equals: hl.wordText, mode: 'insensitive' } }
    });
    if (!word) {
      throw new NotFoundException(`Word "${hl.wordText}" not found in system dictionary`);
    }

    // Check if user already has this word
    const existing = await this.prisma.userWord.findUnique({
      where: { userId_wordId: { userId, wordId: word.id } }
    });
    if (existing) return existing;

    return this.prisma.userWord.create({
      data: {
        userId,
        wordId: word.id,
        status: 'NEW'
      }
    });
  }
}
