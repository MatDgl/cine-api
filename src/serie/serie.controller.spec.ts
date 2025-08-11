/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { SerieController } from './serie.controller';
import { SerieService } from './serie.service';
import { CreateSerieDto } from './dto/create-serie.dto';
import { UpdateSerieDto } from './dto/update-serie.dto';
import { Serie } from '@prisma/client';

describe('SerieController', () => {
  let controller: SerieController;
  let service: SerieService;

  const serie: Serie = {
    id: 1,
    title: 'Breaking Bad',
    src: null,
    rating: 5,
    wishlist: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const serieArray: Serie[] = [serie];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SerieController],
      providers: [
        {
          provide: SerieService,
          useValue: {
            create: jest.fn().mockResolvedValue(serie),
            findAll: jest.fn().mockResolvedValue(serieArray),
            findOne: jest.fn().mockResolvedValue(serie),
            update: jest.fn().mockResolvedValue(serie),
            remove: jest.fn().mockResolvedValue(serie),
          },
        },
      ],
    }).compile();

    controller = module.get<SerieController>(SerieController);
    service = module.get<SerieService>(SerieService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a serie', async () => {
    const dto: CreateSerieDto = {
      title: 'Game of Thrones',
      rating: 9.0,
      wishlist: false,
    };
    await expect(controller.create(dto)).resolves.toEqual(serie);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should return all series', async () => {
    await expect(controller.findAll()).resolves.toEqual(serieArray);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return a serie by id', async () => {
    await expect(controller.findOne('1')).resolves.toEqual(serie);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('should update a serie', async () => {
    const dto: UpdateSerieDto = { title: 'Game of Thrones' };
    await expect(controller.update('1', dto)).resolves.toEqual(serie);
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('should remove a serie', async () => {
    await expect(controller.remove('1')).resolves.toEqual(serie);
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
