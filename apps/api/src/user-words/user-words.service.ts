import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserWordDto } from './dto/create-user-word.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class UserWordsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.userWord.findMany({
      where: { userId },
      include: { word: true }
    });
  }

  async findOne(userId: string, id: string) {
    const userWord = await this.prisma.userWord.findFirst({
      where: { id, userId },
      include: { word: true, notes: { orderBy: { createdAt: 'desc' } } }
    });
    if (!userWord) throw new NotFoundException('Word not found in your bank');
    return userWord;
  }

  async create(userId: string, dto: CreateUserWordDto) {
    return this.prisma.userWord.upsert({
      where: {
        userId_wordId: { userId, wordId: dto.wordId }
      },
      update: {},
      create: {
        userId,
        wordId: dto.wordId,
        status: 'NEW'
      },
      include: { word: true }
    });
  }

  async remove(userId: string, id: string) {
    const userWord = await this.prisma.userWord.findFirst({ where: { id, userId } });
    if (!userWord) throw new NotFoundException();
    return this.prisma.userWord.delete({ where: { id } });
  }

  async getNotes(userId: string, userWordId: string) {
    const userWord = await this.prisma.userWord.findFirst({ where: { id: userWordId, userId } });
    if (!userWord) throw new NotFoundException();
    return this.prisma.wordNote.findMany({ where: { userWordId } });
  }

  async addNote(userId: string, userWordId: string, dto: CreateNoteDto) {
    const userWord = await this.prisma.userWord.findFirst({ where: { id: userWordId, userId } });
    if (!userWord) throw new NotFoundException();
    return this.prisma.wordNote.create({
      data: {
        userWordId,
        title: dto.title,
        content: dto.content
      }
    });
  }

  async updateNote(userId: string, userWordId: string, noteId: string, dto: UpdateNoteDto) {
    const note = await this.prisma.wordNote.findFirst({
      where: { id: noteId, userWord: { id: userWordId, userId } }
    });
    if (!note) throw new NotFoundException();
    return this.prisma.wordNote.update({
      where: { id: noteId },
      data: dto
    });
  }

  async deleteNote(userId: string, userWordId: string, noteId: string) {
    const note = await this.prisma.wordNote.findFirst({
      where: { id: noteId, userWord: { id: userWordId, userId } }
    });
    if (!note) throw new NotFoundException();
    return this.prisma.wordNote.delete({ where: { id: noteId } });
  }
}
