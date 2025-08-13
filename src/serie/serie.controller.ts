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
import { TmdbService, TmdbSerie } from '../tmdb/tmdb.service';
import { CreateSerieDto } from './dto/create-serie.dto';
import { UpdateSerieDto } from './dto/update-serie.dto';
import { Serie } from '@prisma/client';

@Controller('serie')
export class SerieController {
  constructor(
    private readonly serieService: SerieService,
    private readonly tmdb: TmdbService,
  ) {}

  @Post()
  create(@Body() createSerieDto: CreateSerieDto): Promise<Serie> {
    return this.serieService.create(createSerieDto);
  }

  @Get()
  findAll() {
    return this.serieService.findAll();
  }

  @Get('wishlist')
  findWishlist() {
    return this.serieService.findWishlist();
  }

  @Get('non-wishlist')
  findNonWishlist() {
    return this.serieService.findNonWishlist();
  }

  // TMDB proxies
  @Get('search')
  searchFromTmdb(@Query('q') q: string) {
    return this.tmdb.searchSeries(q ?? '');
  }

  @Get('tmdb/:tmdbId')
  getTmdbSerie(@Param('tmdbId') tmdbId: string): Promise<TmdbSerie> {
    return this.tmdb.getSerieDetails(Number(tmdbId));
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
