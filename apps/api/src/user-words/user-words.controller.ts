import { Controller, Get, Post, Patch, Delete, Body, Param, Request } from '@nestjs/common';
import { UserWordsService } from './user-words.service';
import { CreateUserWordDto } from './dto/create-user-word.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Controller('user-words')
export class UserWordsController {
  constructor(private readonly userWordsService: UserWordsService) {}

  @Get()
  async findAll(@Request() req: any) {
    return this.userWordsService.findAll(req.user?.id || 'mock-user-id');
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.userWordsService.findOne(req.user?.id || 'mock-user-id', id);
  }

  @Post()
  async create(@Request() req: any, @Body() dto: CreateUserWordDto) {
    return this.userWordsService.create(req.user?.id || 'mock-user-id', dto);
  }

  @Delete(':id')
  async remove(@Request() req: any, @Param('id') id: string) {
    return this.userWordsService.remove(req.user?.id || 'mock-user-id', id);
  }

  @Get(':id/notes')
  async getNotes(@Request() req: any, @Param('id') id: string) {
    return this.userWordsService.getNotes(req.user?.id || 'mock-user-id', id);
  }

  @Post(':id/notes')
  async addNote(@Request() req: any, @Param('id') id: string, @Body() dto: CreateNoteDto) {
    return this.userWordsService.addNote(req.user?.id || 'mock-user-id', id, dto);
  }

  @Patch(':id/notes/:noteId')
  async updateNote(@Request() req: any, @Param('id') id: string, @Param('noteId') noteId: string, @Body() dto: UpdateNoteDto) {
    return this.userWordsService.updateNote(req.user?.id || 'mock-user-id', id, noteId, dto);
  }

  @Delete(':id/notes/:noteId')
  async deleteNote(@Request() req: any, @Param('id') id: string, @Param('noteId') noteId: string) {
    return this.userWordsService.deleteNote(req.user?.id || 'mock-user-id', id, noteId);
  }
}
