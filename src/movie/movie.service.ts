import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { PrismaService } from '../prisma.service';
import { Movie } from '@prisma/client';
import { TmdbService, TmdbMovie } from '../tmdb/tmdb.service';
import { CreateMovieFromTmdbDto } from './dto/create-movie-from-tmdb.dto';

@Injectable()
export class MovieService {
  private readonly logger = new Logger(MovieService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tmdb: TmdbService,
  ) {}

  create(data: CreateMovieDto): Promise<Movie> {
    return this.prisma.movie.create({ data });
  }

  /**
   * Crée (ou met à jour) un film local à partir d'un tmdbId. Si un film avec ce tmdbId
   * existe déjà on met simplement à jour les champs utilisateurs fournis (rating, wishlist...).
   */
  async createFromTmdb(dto: CreateMovieFromTmdbDto): Promise<Movie> {
    const {
      tmdbId,
      titleOverride,
      rating,
      wishlist,
      review,
      viewCount,
      watched,
    } = dto;
    if (!tmdbId) {
      throw new BadRequestException('tmdbId requis');
    }

    // On récupère les détails TMDB pour obtenir le titre (fr) / fallback original
    const details = await this.tmdb.getMovieDetails(tmdbId);
    const title = titleOverride || details.title || 'Titre inconnu';

    // Upsert basé sur tmdbId unique (champ nullable). On cherche d'abord l'existant.
    const existing = await this.prisma.movie.findUnique({ where: { tmdbId } });
    if (existing) {
      return this.prisma.movie.update({
        where: { id: existing.id },
        data: {
          title, // on peut mettre à jour le titre si différent
          rating: rating ?? existing.rating,
          // wishlist: si non défini on conserve
          wishlist: wishlist ?? existing.wishlist,
          review: review ?? existing.review,
          viewCount: viewCount ?? existing.viewCount,
          watched: watched ?? existing.watched,
        },
      });
    }

    return this.prisma.movie.create({
      data: {
        title,
        tmdbId,
        rating: rating ?? null,
        wishlist: wishlist ?? false,
        review: review ?? null,
        viewCount: viewCount ?? 0,
        watched: watched ?? false,
      },
    });
  }

  async findAll() {
    const filter = {} as const;

    const [items, subsetAgg, withImageCount, unratedCount] = await Promise.all([
      this.prisma.movie.findMany({ where: filter }),
      this.prisma.movie.aggregate({
        where: filter,
        _avg: { rating: true },
        _max: { updatedAt: true, rating: true },
        _min: { createdAt: true, rating: true },
        _count: { _all: true },
      }),
      this.prisma.movie.count({
        where: {
          AND: [{ tmdbId: { not: null } }],
        },
      }),
      this.prisma.movie.count({ where: { rating: null } }),
    ]);

    const count = subsetAgg._count?._all ?? items.length;
    const ratedCount = Math.max(0, count - unratedCount);
    const round2 = (n: number | null) =>
      n == null ? null : Math.round(n * 100) / 100;

    const enrichedItems = await this.enrichPosterPath(items);

    return {
      count,
      avgRating: round2(subsetAgg._avg.rating ?? null),
      maxRating: round2(subsetAgg._max.rating ?? null),
      minRating: round2(subsetAgg._min.rating ?? null),
      lastUpdatedAt: subsetAgg._max.updatedAt ?? null,
      firstCreatedAt: subsetAgg._min.createdAt ?? null,
      withImageCount,
      missingImageCount: Math.max(0, count - withImageCount),
      unratedCount,
      ratedCount,
      items: enrichedItems,
    } as const;
  }

  async findWishlist() {
    const filter = { wishlist: true } as const;

    const [items, subsetAgg, withImageCount, unratedCount] = await Promise.all([
      this.prisma.movie.findMany({ where: filter }),
      this.prisma.movie.aggregate({
        where: filter,
        _avg: { rating: true },
        _max: { updatedAt: true, rating: true },
        _min: { createdAt: true, rating: true },
        _count: { _all: true },
      }),
      this.prisma.movie.count({
        where: {
          AND: [{ wishlist: true }, { tmdbId: { not: null } }],
        },
      }),
      this.prisma.movie.count({ where: { wishlist: true, rating: null } }),
    ]);

    const count = subsetAgg._count?._all ?? items.length;
    const ratedCount = Math.max(0, count - unratedCount);
    const round2 = (n: number | null) =>
      n == null ? null : Math.round(n * 100) / 100;

    const enrichedItems = await this.enrichPosterPath(items);

    return {
      count,
      avgRating: round2(subsetAgg._avg.rating ?? null),
      maxRating: round2(subsetAgg._max.rating ?? null),
      minRating: round2(subsetAgg._min.rating ?? null),
      lastUpdatedAt: subsetAgg._max.updatedAt ?? null,
      firstCreatedAt: subsetAgg._min.createdAt ?? null,
      withImageCount,
      missingImageCount: Math.max(0, count - withImageCount),
      unratedCount,
      ratedCount,
      items: enrichedItems,
    } as const;
  }

  async findRated() {
    const filter = { rating: { gt: 0 } } as const;

    const [items, subsetAgg, withImageCount] = await Promise.all([
      this.prisma.movie.findMany({ where: filter }),
      this.prisma.movie.aggregate({
        where: filter,
        _avg: { rating: true },
        _max: { updatedAt: true, rating: true },
        _min: { createdAt: true, rating: true },
        _count: { _all: true },
      }),
      this.prisma.movie.count({
        where: { AND: [{ rating: { gt: 0 } }, { tmdbId: { not: null } }] },
      }),
    ]);

    const count = subsetAgg._count?._all ?? items.length;
    const unratedCount = 0;
    const ratedCount = count; // tous sont notés
    const round2 = (n: number | null) =>
      n == null ? null : Math.round(n * 100) / 100;

    const enrichedItems = await this.enrichPosterPath(items);

    return {
      count,
      avgRating: round2(subsetAgg._avg.rating ?? null),
      maxRating: round2(subsetAgg._max.rating ?? null),
      minRating: round2(subsetAgg._min.rating ?? null),
      lastUpdatedAt: subsetAgg._max.updatedAt ?? null,
      firstCreatedAt: subsetAgg._min.createdAt ?? null,
      withImageCount,
      missingImageCount: Math.max(0, count - withImageCount),
      unratedCount,
      ratedCount,
      items: enrichedItems,
    } as const;
  }

  async findOne(id: number): Promise<(Movie & { tmdb?: TmdbMovie }) | null> {
    const movie = await this.prisma.movie.findUnique({ where: { id } });
    if (!movie) {
      return null;
    }

    if (movie.tmdbId == null) {
      return movie;
    }

    try {
      const details = await this.tmdb.getMovieDetails(movie.tmdbId);
      return { ...movie, tmdb: details } as const;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des détails TMDB pour tmdbId ${movie.tmdbId}:`,
        error,
      );
      return movie;
    }
  }

  /**
   * Récupère les détails TMDB et l'éventuel enregistrement local via tmdbId.
   * Le champ `local` vaut `null` si l'élément n'existe pas en base.
   */
  async findByTmdbIdWithTmdbDetails(tmdbId: number): Promise<{
    local: Movie | null;
    tmdb: TmdbMovie;
  }> {
    const [tmdb, local] = await Promise.all([
      this.tmdb.getMovieDetails(tmdbId),
      this.prisma.movie.findUnique({ where: { tmdbId } }),
    ]);
    return { local: local || null, tmdb } as const;
  }

  update(id: number, data: UpdateMovieDto): Promise<Movie> {
    return this.prisma.movie.update({ where: { id }, data });
  }

  remove(id: number): Promise<Movie> {
    return this.prisma.movie.delete({ where: { id } });
  }

  /**
   * Recherche des films via TMDB et indique si déjà présent localement
   */
  async search(query: string, limit = 20) {
    const trimmed = query.trim();
    if (!trimmed) {
      return { query: trimmed, limit, total: 0, results: [] as const } as const;
    }

    const tmdb = await this.tmdb.searchMovies(trimmed);
    const tmdbIds = tmdb.results
      .slice(0, limit)
      .map((m) => m.id)
      .filter(Boolean);
    const existing = await this.prisma.movie.findMany({
      where: { tmdbId: { in: tmdbIds } },
    });
    const existingMap = new Map(existing.map((m) => [m.tmdbId, m]));

    const sliced = tmdb.results.slice(0, limit);

    return {
      query: trimmed,
      limit,
      total: sliced.length,
      results: sliced.map((r) => ({
        type: 'movie' as const,
        tmdbId: r.id,
        title: r.title,
        poster_path: r.poster_path,
        overview: r.overview,
        release_date: r.release_date,
        vote_average: r.vote_average,
        local: existingMap.get(r.id) || null,
      })),
    } as const;
  }

  /**
   * Enrichit chaque film avec tmdb.poster_path (limitation: 5 requêtes parallèles max pour éviter de surcharger l'API)
   */
  private async enrichPosterPath<
    T extends { tmdbId: number | null; id: number },
  >(items: T[]): Promise<(T & { tmdb?: { poster_path: string | null } })[]> {
    const concurrency = 5;
    const queue = [...items];
    const result: (T & { tmdb?: { poster_path: string | null } })[] = [];

    const workers: Promise<void>[] = [];
    for (let i = 0; i < concurrency; i++) {
      workers.push(
        (async () => {
          while (queue.length) {
            const item = queue.shift();
            if (!item) break;
            if (!item.tmdbId) {
              result.push(item);
              continue;
            }
            try {
              const details = await this.tmdb.getMovieDetails(item.tmdbId);
              result.push({
                ...item,
                tmdb: { poster_path: details.poster_path },
              });
            } catch {
              result.push(item);
            }
          }
        })(),
      );
    }
    await Promise.all(workers);
    // Conserver l'ordre initial
    return items.map((orig) => result.find((r) => r.id === orig.id) || orig);
  }
}
