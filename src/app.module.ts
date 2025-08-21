import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MovieModule } from './movie/movie.module';
import { SerieModule } from './serie/serie.module';
import { TmdbModule } from './tmdb/tmdb.module';
import { HttpLoggerMiddleware } from './common/middleware/http-logger.middleware';
import { PrismaService } from './prisma.service';

@Module({
  imports: [MovieModule, SerieModule, TmdbModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
