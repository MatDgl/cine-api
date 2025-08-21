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
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from '@prisma/client';
// TMDB details handled via service aggregation
import { CreateMovieFromTmdbDto } from './dto/create-movie-from-tmdb.dto';

@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Post()
  create(@Body() createMovieDto: CreateMovieDto): Promise<Movie> {
    return this.movieService.create(createMovieDto);
  }

  // Création (ou mise à jour) d'un film local à partir d'un tmdbId et champs optionnels
  @Post('tmdb')
  createFromTmdb(
    @Body() createFromTmdbDto: CreateMovieFromTmdbDto,
  ): Promise<Movie> {
    return this.movieService.createFromTmdb(createFromTmdbDto);
  }

  @Get()
  findAll() {
    return this.movieService.findAll();
  }

  @Get('wishlist')
  findWishlist() {
    return this.movieService.findWishlist();
  }

  @Get('rated')
  findRated() {
    return this.movieService.findRated();
  }

  @Get('search')
  search(@Query('q') q: string, @Query('limit') limitRaw?: string) {
    const limit = Math.max(1, Math.min(50, Number(limitRaw) || 20));
    return this.movieService.search(q || '', limit);
  }

  // Récupération des détails TMDB sans enregistrement local
  @Get('tmdb/:tmdbId')
  getTmdbMovie(@Param('tmdbId') tmdbId: string) {
    return this.movieService.findByTmdbIdWithTmdbDetails(Number(tmdbId));
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Movie | null> {
    return this.movieService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateMovieDto: UpdateMovieDto,
  ): Promise<Movie> {
    return this.movieService.update(+id, updateMovieDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Movie> {
    return this.movieService.remove(+id);
  }
}
