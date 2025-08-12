import { Injectable } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { PrismaService } from '../prisma.service';
import { Movie } from '@prisma/client';

@Injectable()
export class MovieService {
  constructor(private readonly prisma: PrismaService) {}

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
          AND: [{ src: { not: null } }, { src: { not: '' } }],
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
          AND: [
            { wishlist: true },
            { src: { not: null } },
            { src: { not: '' } },
          ],
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
          AND: [
            { wishlist: false },
            { src: { not: null } },
            { src: { not: '' } },
          ],
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

  findOne(id: number): Promise<Movie | null> {
    return this.prisma.movie.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateMovieDto): Promise<Movie> {
    return this.prisma.movie.update({ where: { id }, data });
  }

  remove(id: number): Promise<Movie> {
    return this.prisma.movie.delete({ where: { id } });
  }
}
