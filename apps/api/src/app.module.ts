import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { WordsModule } from './words/words.module';
import { UserWordsModule } from './user-words/user-words.module';
import { AiModule } from './ai/ai.module';
import { QuizModule } from './quiz/quiz.module';
import { ReadingModule } from './reading/reading.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [PrismaModule, AuthModule, WordsModule, UserWordsModule, AiModule, QuizModule, ReadingModule, PaymentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
