import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryWordsDto } from './dto/query-words.dto';

@Injectable()
export class WordsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryWordsDto) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const skip = (page - 1) * limit;

    const where = query.band ? { band: query.band } : {};

    const [data, total] = await Promise.all([
      this.prisma.word.findMany({ where, skip, take: limit }),
      this.prisma.word.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getRandom(band?: string) {
    const where = band ? { band } : undefined;
    const count = await this.prisma.word.count({ where });
    if (count === 0) throw new NotFoundException('No words found');
    
    const skip = Math.floor(Math.random() * count);
    const words = await this.prisma.word.findMany({
      where,
      take: 1,
      skip,
    });
    return words[0];
  }

  async search(q: string = '') {
    if (!q.trim()) return [];
    return this.prisma.word.findMany({
      where: { word: { contains: q, mode: 'insensitive' } },
      take: 10,
    });
  }

  async findOne(id: string) {
    const word = await this.prisma.word.findUnique({ where: { id } });
    if (!word) throw new NotFoundException('Word not found');
    return word;
  }
}
