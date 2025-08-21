import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { TmdbService, TmdbMultiRaw } from './tmdb/tmdb.service';
import { PrismaService } from './prisma.service';
import { Movie, Serie } from '@prisma/client';

// Items renvoyés par les recherches individuelles (movie/serie services)
export interface SearchResultItem {
  type: 'movie' | 'serie';
  tmdbId: number;
  title: string;
  poster_path: string | null;
  overview?: string | null;
  release_date?: string; // films
  first_air_date?: string; // séries
  vote_average?: number;
  local?: unknown;
  director?: string | null; // réalisateur / premier créateur
  [k: string]: unknown; // champs additionnels tolérés
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly tmdb: TmdbService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('search')
  async globalSearch(
    @Query('q') q: string,
    @Query('limit') limitRaw?: string,
  ): Promise<{
    query: string;
    limit: number;
    total: number;
    results: SearchResultItem[];
  }> {
    const query = (q || '').trim();
    const limit = Math.max(1, Math.min(50, Number(limitRaw) || 20));
    if (!query) {
      return { query, limit, total: 0, results: [] };
    }

    // Recherche multi directement via TMDB (films + séries) puis enrichissement local
    const multi = await this.tmdb.searchMulti(query);
    // TMDB renvoie déjà par pertinence; on limite
    const slice: TmdbMultiRaw[] = multi.results.slice(0, limit);

    // Séparer les tmdbIds par type
    const movieIds = slice
      .filter((r) => r.media_type === 'movie')
      .map((r) => r.id);
    const serieIds = slice
      .filter((r) => r.media_type === 'tv')
      .map((r) => r.id);

    const [existingMovies, existingSeries]: [Movie[], Serie[]] =
      await Promise.all([
        movieIds.length
          ? this.prisma.movie.findMany({ where: { tmdbId: { in: movieIds } } })
          : Promise.resolve([]),
        serieIds.length
          ? this.prisma.serie.findMany({ where: { tmdbId: { in: serieIds } } })
          : Promise.resolve([]),
      ]);
    const movieMap: Map<number, Movie> = new Map(
      existingMovies
        .filter((m) => m.tmdbId != null)
        .map((m) => [m.tmdbId as number, m]),
    );
    const serieMap: Map<number, Serie> = new Map(
      existingSeries
        .filter((s) => s.tmdbId != null)
        .map((s) => [s.tmdbId as number, s]),
    );

    // Préparation mapping réalisateurs (enrichissement ultérieur)
    const movieDirectorMap = new Map<number, string | null>();
    const serieDirectorMap = new Map<number, string | null>();

    // Récupère détails TMDB pour extraire le réalisateur (movies) / créateur principal (series)
    const enrichDirectors = async () => {
      const concurrency = 5;
      const tasks: Array<() => Promise<void>> = [];
      for (const r of slice) {
        if (r.media_type === 'movie') {
          tasks.push(async () => {
            try {
              const details = await this.tmdb.getMovieDetails(r.id);
              const director =
                details.credits?.crew?.find((c) => c.job === 'Director')
                  ?.name || null;
              movieDirectorMap.set(r.id, director);
            } catch {
              movieDirectorMap.set(r.id, null);
            }
          });
        } else if (r.media_type === 'tv') {
          tasks.push(async () => {
            try {
              const details = await this.tmdb.getSerieDetails(r.id);
              const creator =
                (details.created_by && details.created_by[0]?.name) || null;
              serieDirectorMap.set(r.id, creator);
            } catch {
              serieDirectorMap.set(r.id, null);
            }
          });
        }
      }
      // Exécuter avec limite de concurrence
      const workers: Promise<void>[] = [];
      const queue = [...tasks];
      for (let i = 0; i < concurrency; i++) {
        workers.push(
          (async () => {
            while (queue.length) {
              const job = queue.shift();
              if (!job) break;
              await job();
            }
          })(),
        );
      }
      await Promise.all(workers);
    };

    await enrichDirectors();

    const results: SearchResultItem[] = slice.map((r) => {
      const isMovie = r.media_type === 'movie';
      const local = (isMovie ? movieMap.get(r.id) : serieMap.get(r.id)) || null;
      return isMovie
        ? {
            type: 'movie',
            tmdbId: r.id,
            title: r.title || r.name || '',
            poster_path: r.poster_path || null,
            overview: r.overview || null,
            release_date: r.release_date,
            vote_average: r.vote_average,
            local,
            director: movieDirectorMap.get(r.id) ?? null,
          }
        : {
            type: 'serie',
            tmdbId: r.id,
            title: r.name || r.title || '',
            poster_path: r.poster_path || null,
            overview: r.overview || null,
            first_air_date: r.first_air_date,
            vote_average: r.vote_average,
            local,
            director: serieDirectorMap.get(r.id) ?? null,
          };
    });

    return { query, limit, total: results.length, results };
  }
}
