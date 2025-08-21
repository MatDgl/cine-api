import { Module } from '@nestjs/common';
import { SerieService } from './serie.service';
import { SerieController } from './serie.controller';
import { PrismaService } from '../prisma.service';
import { TmdbModule } from '../tmdb/tmdb.module';

@Module({
  imports: [TmdbModule],
  controllers: [SerieController],
  providers: [SerieService, PrismaService],
  exports: [SerieService],
})
export class SerieModule {}
