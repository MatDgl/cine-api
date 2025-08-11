/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movie.service';
import { PrismaService } from '../prisma.service';
import { Movie } from '@prisma/client';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

describe('MovieService', () => {
  let service: MovieService;
  let prisma: PrismaService;

  const movie: Movie = {
    id: 1,
    title: 'Inception',
    src: null,
    rating: 5,
    wishlist: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const movieArray: Movie[] = [movie];

  beforeEach(async () => {
    const prismaMock = {
      movie: {
        create: jest.fn().mockResolvedValue(movie),
        findMany: jest.fn().mockResolvedValue(movieArray),
        findUnique: jest.fn().mockResolvedValue(movie),
        update: jest.fn().mockResolvedValue(movie),
        delete: jest.fn().mockResolvedValue(movie),
      },
    } as unknown as PrismaService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<MovieService>(MovieService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a movie', async () => {
    const dto: CreateMovieDto = {
      title: 'Interstellar',
      rating: 5,
      wishlist: false,
    };
    await expect(service.create(dto)).resolves.toEqual(movie);
    expect(prisma.movie.create).toHaveBeenCalledWith({ data: dto });
  });

  it('should return all movies', async () => {
    await expect(service.findAll()).resolves.toEqual(movieArray);
    expect(prisma.movie.findMany).toHaveBeenCalled();
  });

  it('should return a movie by id', async () => {
    await expect(service.findOne(1)).resolves.toEqual(movie);
    expect(prisma.movie.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should update a movie', async () => {
    const dto: UpdateMovieDto = { title: 'Interstellar' };
    await expect(service.update(1, dto)).resolves.toEqual(movie);
    expect(prisma.movie.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: dto,
    });
  });

  it('should remove a movie', async () => {
    await expect(service.remove(1)).resolves.toEqual(movie);
    expect(prisma.movie.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
