import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { SerieService } from './serie.service';
// TMDB details récupérés via SerieService (agrégation)
import { CreateSerieDto } from './dto/create-serie.dto';
import { UpdateSerieDto } from './dto/update-serie.dto';
import { Serie } from '@prisma/client';
import { CreateSerieFromTmdbDto } from './dto/create-serie-from-tmdb.dto';

@Controller('serie')
export class SerieController {
  constructor(private readonly serieService: SerieService) {}

  @Post()
  create(@Body() createSerieDto: CreateSerieDto): Promise<Serie> {
    return this.serieService.create(createSerieDto);
  }

  @Post('tmdb')
  createFromTmdb(
    @Body() createFromTmdbDto: CreateSerieFromTmdbDto,
  ): Promise<Serie> {
    return this.serieService.createFromTmdb(createFromTmdbDto);
  }

  @Get()
  findAll() {
    return this.serieService.findAll();
  }

  @Get('wishlist')
  findWishlist() {
    return this.serieService.findWishlist();
  }

  @Get('rated')
  findRated() {
    return this.serieService.findRated();
  }

  // Recherche mixte TMDB + statut local
  @Get('search')
  search(@Query('q') q: string, @Query('limit') limitRaw?: string) {
    const limit = Math.max(1, Math.min(50, Number(limitRaw) || 20));
    return this.serieService.search(q || '', limit);
  }

  @Get('tmdb/:tmdbId')
  getTmdbSerie(@Param('tmdbId') tmdbId: string) {
    return this.serieService.findByTmdbIdWithTmdbDetails(Number(tmdbId));
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Serie | null> {
    return this.serieService.findOne(+id);
  }
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateSerieDto: UpdateSerieDto,
  ): Promise<Serie> {
    return this.serieService.update(+id, updateSerieDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Serie> {
    return this.serieService.remove(+id);
  }
}
