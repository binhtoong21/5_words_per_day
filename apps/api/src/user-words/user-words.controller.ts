import { Controller, Get, Post, Patch, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { UserWordsService } from './user-words.service';
import { CreateUserWordDto } from './dto/create-user-word.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user-words')
@UseGuards(JwtAuthGuard)
export class UserWordsController {
  constructor(private readonly userWordsService: UserWordsService) {}

  @Get('stats')
  async getStats(@Request() req: Express.Request & { user: { id: string } }) {
    return this.userWordsService.getStats(req.user.id);
  }

  @Get()
  async findAll(@Request() req: Express.Request & { user: { id: string } }) {
    return this.userWordsService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(@Request() req: Express.Request & { user: { id: string } }, @Param('id') id: string) {
    return this.userWordsService.findOne(req.user.id, id);
  }

  @Post()
  async create(@Request() req: Express.Request & { user: { id: string } }, @Body() dto: CreateUserWordDto) {
    return this.userWordsService.create(req.user.id, dto);
  }

  @Delete(':id')
  async remove(@Request() req: Express.Request & { user: { id: string } }, @Param('id') id: string) {
    return this.userWordsService.remove(req.user.id, id);
  }

  @Get(':id/notes')
  async getNotes(@Request() req: Express.Request & { user: { id: string } }, @Param('id') id: string) {
    return this.userWordsService.getNotes(req.user.id, id);
  }

  @Post(':id/notes')
  async addNote(@Request() req: Express.Request & { user: { id: string } }, @Param('id') id: string, @Body() dto: CreateNoteDto) {
    return this.userWordsService.addNote(req.user.id, id, dto);
  }

  @Patch(':id/notes/:noteId')
  async updateNote(@Request() req: Express.Request & { user: { id: string } }, @Param('id') id: string, @Param('noteId') noteId: string, @Body() dto: UpdateNoteDto) {
    return this.userWordsService.updateNote(req.user.id, id, noteId, dto);
  }

  @Delete(':id/notes/:noteId')
  async deleteNote(@Request() req: Express.Request & { user: { id: string } }, @Param('id') id: string, @Param('noteId') noteId: string) {
    return this.userWordsService.deleteNote(req.user.id, id, noteId);
  }
}
