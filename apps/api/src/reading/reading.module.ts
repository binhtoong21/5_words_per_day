import { Module } from '@nestjs/common';
import { ReadingController } from './reading.controller';
import { ReadingService } from './reading.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [ReadingController],
  providers: [ReadingService],
})
export class ReadingModule {}
