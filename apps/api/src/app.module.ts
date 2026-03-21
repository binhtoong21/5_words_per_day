import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { WordsModule } from './words/words.module';
import { UserWordsModule } from './user-words/user-words.module';
import { AiModule } from './ai/ai.module';
import { QuizModule } from './quiz/quiz.module';
import { ReadingModule } from './reading/reading.module';

@Module({
  imports: [PrismaModule, AuthModule, WordsModule, UserWordsModule, AiModule, QuizModule, ReadingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply((req: any, res: any, next: any) => {
      const userId = req.headers['x-user-id'];
      if (userId) {
        req.user = { id: userId };
      }
      next();
    }).forRoutes('*');
  }
}
