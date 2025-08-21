import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateSerieDto } from './dto/create-serie.dto';
import { UpdateSerieDto } from './dto/update-serie.dto';
import { Serie } from '@prisma/client';
import { TmdbService, TmdbSerie } from '../tmdb/tmdb.service';
import { CreateSerieFromTmdbDto } from './dto/create-serie-from-tmdb.dto';

@Injectable()
export class SerieService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tmdb: TmdbService,
  ) {}

  create(data: CreateSerieDto): Promise<Serie> {
    return this.prisma.serie.create({ data });
  }

  /**
   * Crée (ou met à jour) une série locale à partir d'un tmdbId
   */
  async createFromTmdb(dto: CreateSerieFromTmdbDto): Promise<Serie> {
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
    const details = await this.tmdb.getSerieDetails(tmdbId);
    const title = titleOverride || details.name || 'Titre inconnu';
    const existing = await this.prisma.serie.findUnique({ where: { tmdbId } });
    if (existing) {
      return this.prisma.serie.update({
        where: { id: existing.id },
        data: {
          title,
          rating: rating ?? existing.rating,
          wishlist: wishlist ?? existing.wishlist,
          review: review ?? existing.review,
          viewCount: viewCount ?? existing.viewCount,
          watched: watched ?? existing.watched,
        },
      });
    }
    return this.prisma.serie.create({
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
      this.prisma.serie.findMany({ where: filter }),
      this.prisma.serie.aggregate({
        where: filter,
        _avg: { rating: true },
        _max: { updatedAt: true, rating: true },
        _min: { createdAt: true, rating: true },
        _count: { _all: true },
      }),
      this.prisma.serie.count({
        where: {
          AND: [{ tmdbId: { not: null } }],
        },
      }),
      this.prisma.serie.count({ where: { rating: null } }),
    ]);

    const count = subsetAgg._count?._all ?? items.length;
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
      ratedCount: Math.max(0, count - unratedCount),
      items: enrichedItems,
    } as const;
  }

  async findWishlist() {
    const filter = { wishlist: true } as const;

    const [items, subsetAgg, withImageCount, unratedCount] = await Promise.all([
      this.prisma.serie.findMany({ where: filter }),
      this.prisma.serie.aggregate({
        where: filter,
        _avg: { rating: true },
        _max: { updatedAt: true, rating: true },
        _min: { createdAt: true, rating: true },
        _count: { _all: true },
      }),
      this.prisma.serie.count({
        where: {
          AND: [{ wishlist: true }, { tmdbId: { not: null } }],
        },
      }),
      this.prisma.serie.count({ where: { wishlist: true, rating: null } }),
    ]);

    const count = subsetAgg._count?._all ?? items.length;
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
      ratedCount: Math.max(0, count - unratedCount),
      items: enrichedItems,
    } as const;
  }

  async findRated() {
    const filter = { rating: { gt: 0 } } as const;

    const [items, subsetAgg, withImageCount] = await Promise.all([
      this.prisma.serie.findMany({ where: filter }),
      this.prisma.serie.aggregate({
        where: filter,
        _avg: { rating: true },
        _max: { updatedAt: true, rating: true },
        _min: { createdAt: true, rating: true },
        _count: { _all: true },
      }),
      this.prisma.serie.count({
        where: { AND: [{ rating: { gt: 0 } }, { tmdbId: { not: null } }] },
      }),
    ]);

    const count = subsetAgg._count?._all ?? items.length;
    const unratedCount = 0;
    const ratedCount = count;
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

  async findOne(id: number): Promise<(Serie & { tmdb?: TmdbSerie }) | null> {
    const serie = await this.prisma.serie.findUnique({ where: { id } });
    if (!serie) return null;
    if (serie.tmdbId == null) return serie;

    try {
      const details = await this.tmdb.getSerieDetails(serie.tmdbId);
      return { ...serie, tmdb: details } as const;
    } catch (e) {
      console.error('Failed to fetch TMDB details:', e);
      return serie;
    }
  }

  async findByTmdbIdWithTmdbDetails(tmdbId: number): Promise<{
    local: Serie | null;
    tmdb: TmdbSerie;
  }> {
    const [tmdb, local] = await Promise.all([
      this.tmdb.getSerieDetails(tmdbId),
      this.prisma.serie.findUnique({ where: { tmdbId } }),
    ]);
    return { local: local || null, tmdb } as const;
  }

  update(id: number, data: UpdateSerieDto): Promise<Serie> {
    return this.prisma.serie.update({ where: { id }, data });
  }

  remove(id: number): Promise<Serie> {
    return this.prisma.serie.delete({ where: { id } });
  }

  /**
   * Enrichit chaque série avec tmdb.poster_path (limite: 5 requêtes parallèles)
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
              const details = await this.tmdb.getSerieDetails(item.tmdbId);
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
    return items.map((orig) => result.find((r) => r.id === orig.id) || orig);
  }

  /**
   * Recherche des séries via TMDB et indique si déjà présent localement
   */
  async search(query: string, limit = 20) {
    const trimmed = query.trim();
    if (!trimmed) {
      return { query: trimmed, limit, total: 0, results: [] as const } as const;
    }

    const tmdb = await this.tmdb.searchSeries(trimmed);
    const tmdbIds = tmdb.results
      .slice(0, limit)
      .map((s) => s.id)
      .filter(Boolean);
    const existing = await this.prisma.serie.findMany({
      where: { tmdbId: { in: tmdbIds } },
    });
    const existingMap = new Map(existing.map((s) => [s.tmdbId, s]));
    const sliced = tmdb.results.slice(0, limit);

    return {
      query: trimmed,
      limit,
      total: sliced.length,
      results: sliced.map((r) => ({
        type: 'serie' as const,
        tmdbId: r.id,
        title: r.name,
        poster_path: r.poster_path,
        overview: r.overview,
        first_air_date: r.first_air_date,
        vote_average: r.vote_average,
        local: existingMap.get(r.id) || null,
      })),
    } as const;
  }
}
