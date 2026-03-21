import { Controller, Get, Query, Param } from '@nestjs/common';
import { WordsService } from './words.service';
import { QueryWordsDto } from './dto/query-words.dto';

@Controller('words')
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Get()
  async findAll(@Query() query: QueryWordsDto) {
    return this.wordsService.findAll(query);
  }

  @Get('random')
  async getRandom(@Query('band') band?: string) {
    return this.wordsService.getRandom(band);
  }

  @Get('search')
  async search(@Query('q') q?: string) {
    return this.wordsService.search(q);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.wordsService.findOne(id);
  }
}
