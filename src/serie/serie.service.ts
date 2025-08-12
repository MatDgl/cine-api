import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateSerieDto } from './dto/create-serie.dto';
import { UpdateSerieDto } from './dto/update-serie.dto';
import { Serie } from '@prisma/client';

@Injectable()
export class SerieService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateSerieDto): Promise<Serie> {
    return this.prisma.serie.create({ data });
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
          AND: [{ src: { not: null } }, { src: { not: '' } }],
        },
      }),
      this.prisma.serie.count({ where: { rating: null } }),
    ]);

    const count = subsetAgg._count?._all ?? items.length;
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
      ratedCount: Math.max(0, count - unratedCount),
      items,
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
          AND: [
            { wishlist: true },
            { src: { not: null } },
            { src: { not: '' } },
          ],
        },
      }),
      this.prisma.serie.count({ where: { wishlist: true, rating: null } }),
    ]);

    const count = subsetAgg._count?._all ?? items.length;
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
      ratedCount: Math.max(0, count - unratedCount),
      items,
    } as const;
  }

  async findNonWishlist() {
    const filter = { wishlist: false } as const;

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
          AND: [
            { wishlist: false },
            { src: { not: null } },
            { src: { not: '' } },
          ],
        },
      }),
      this.prisma.serie.count({ where: { wishlist: false, rating: null } }),
    ]);

    const count = subsetAgg._count?._all ?? items.length;
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
      ratedCount: Math.max(0, count - unratedCount),
      items,
    } as const;
  }

  findOne(id: number): Promise<Serie | null> {
    return this.prisma.serie.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateSerieDto): Promise<Serie> {
    return this.prisma.serie.update({ where: { id }, data });
  }

  remove(id: number): Promise<Serie> {
    return this.prisma.serie.delete({ where: { id } });
  }
}
