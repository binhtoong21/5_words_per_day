import { Controller, Get, Post, Body, Param, Request, UseGuards } from '@nestjs/common';
import { ReadingService } from './reading.service';
import { CreateHighlightDto } from './dto/create-highlight.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('passages')
@UseGuards(JwtAuthGuard)
export class ReadingController {
  constructor(private readonly readingService: ReadingService) {}

  @Get()
  async findAll(@Request() req: Express.Request & { user: { id: string } }) {
    return this.readingService.findAll(req.user.id);
  }

  @Post()
  async create(@Request() req: Express.Request & { user: { id: string } }) {
    return this.readingService.create(req.user.id);
  }

  @Get(':id')
  async findOne(@Request() req: Express.Request & { user: { id: string } }, @Param('id') id: string) {
    return this.readingService.findOne(req.user.id, id);
  }

  @Post(':id/highlight')
  async highlight(@Request() req: Express.Request & { user: { id: string } }, @Param('id') id: string, @Body() dto: CreateHighlightDto) {
    return this.readingService.highlight(req.user.id, id, dto);
  }

  @Post(':id/highlights/:highlightId/add-to-kho')
  async addToBank(@Request() req: Express.Request & { user: { id: string } }, @Param('id') id: string, @Param('highlightId') highlightId: string) {
    return this.readingService.addToBank(req.user.id, id, highlightId);
  }
}
