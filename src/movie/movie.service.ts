import { Injectable, Logger } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { PrismaService } from '../prisma.service';
import { Movie } from '@prisma/client';
import { TmdbService, TmdbMovie } from '../tmdb/tmdb.service';

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
      items,
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
      items,
    } as const;
  }

  async findNonWishlist() {
    const filter = { wishlist: false } as const;

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
          AND: [{ wishlist: false }, { tmdbId: { not: null } }],
        },
      }),
      this.prisma.movie.count({ where: { wishlist: false, rating: null } }),
    ]);

    const count = subsetAgg._count?._all ?? items.length;
    const ratedCount = Math.max(0, count - unratedCount);
    const round2 = (n: number | null) =>
      n == null ? null : Math.round(n * 100) / 100;

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
      items,
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

  update(id: number, data: UpdateMovieDto): Promise<Movie> {
    return this.prisma.movie.update({ where: { id }, data });
  }

  remove(id: number): Promise<Movie> {
    return this.prisma.movie.delete({ where: { id } });
  }
}
