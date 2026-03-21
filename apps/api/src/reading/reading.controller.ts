import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { ReadingService } from './reading.service';
import { CreateHighlightDto } from './dto/create-highlight.dto';

@Controller('passages')
export class ReadingController {
  constructor(private readonly readingService: ReadingService) {}

  @Get()
  async findAll(@Request() req: any) {
    return this.readingService.findAll(req.user?.id || 'mock');
  }

  @Post()
  async create(@Request() req: any) {
    return this.readingService.create(req.user?.id || 'mock');
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.readingService.findOne(req.user?.id || 'mock', id);
  }

  @Post(':id/highlight')
  async highlight(@Request() req: any, @Param('id') id: string, @Body() dto: CreateHighlightDto) {
    return this.readingService.highlight(req.user?.id || 'mock', id, dto);
  }

  @Post(':id/highlights/:highlightId/add-to-kho')
  async addToBank(@Request() req: any, @Param('id') id: string, @Param('highlightId') highlightId: string) {
    return this.readingService.addToBank(req.user?.id || 'mock', id, highlightId);
  }
}
