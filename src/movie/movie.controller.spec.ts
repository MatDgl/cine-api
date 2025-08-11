/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from '@prisma/client';

describe('MovieController', () => {
  let controller: MovieController;
  let service: MovieService;

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
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovieController],
      providers: [
        {
          provide: MovieService,
          useValue: {
            create: jest.fn().mockResolvedValue(movie),
            findAll: jest.fn().mockResolvedValue(movieArray),
            findOne: jest.fn().mockResolvedValue(movie),
            update: jest.fn().mockResolvedValue(movie),
            remove: jest.fn().mockResolvedValue(movie),
          },
        },
      ],
    }).compile();

    controller = module.get<MovieController>(MovieController);
    service = module.get<MovieService>(MovieService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a movie', async () => {
    const dto: CreateMovieDto = {
      title: 'Interstellar',
      rating: 4.5,
      wishlist: false,
    };
    await expect(controller.create(dto)).resolves.toEqual(movie);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should return all movies', async () => {
    await expect(controller.findAll()).resolves.toEqual(movieArray);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return a movie by id', async () => {
    await expect(controller.findOne('1')).resolves.toEqual(movie);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('should update a movie', async () => {
    const dto: UpdateMovieDto = { title: 'Interstellar' };
    await expect(controller.update('1', dto)).resolves.toEqual(movie);
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('should remove a movie', async () => {
    await expect(controller.remove('1')).resolves.toEqual(movie);
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
