/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { SerieService } from './serie.service';
import { PrismaService } from '../prisma.service';
import { Serie } from '@prisma/client';
import { CreateSerieDto } from './dto/create-serie.dto';
import { UpdateSerieDto } from './dto/update-serie.dto';

describe('SerieService', () => {
  let service: SerieService;
  let prisma: PrismaService;

  const serie: Serie = {
    id: 1,
    title: 'Breaking Bad',
    src: null,
    rating: 9.5,
    wishlist: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const serieArray: Serie[] = [serie];

  beforeEach(async () => {
    const prismaMock = {
      serie: {
        create: jest.fn().mockResolvedValue(serie),
        findMany: jest.fn().mockResolvedValue(serieArray),
        findUnique: jest.fn().mockResolvedValue(serie),
        update: jest.fn().mockResolvedValue(serie),
        delete: jest.fn().mockResolvedValue(serie),
      },
    } as unknown as PrismaService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SerieService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<SerieService>(SerieService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a serie', async () => {
    const dto: CreateSerieDto = {
      title: 'Better Call Saul',
      rating: 9.0,
      wishlist: false,
    };
    await expect(service.create(dto)).resolves.toEqual(serie);
    expect(prisma.serie.create).toHaveBeenCalledWith({ data: dto });
  });

  it('should return all series', async () => {
    await expect(service.findAll()).resolves.toEqual(serieArray);
    expect(prisma.serie.findMany).toHaveBeenCalled();
  });

  it('should return a serie by id', async () => {
    await expect(service.findOne(1)).resolves.toEqual(serie);
    expect(prisma.serie.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should update a serie', async () => {
    const dto: UpdateSerieDto = { title: 'Breaking Bad 2' };
    await expect(service.update(1, dto)).resolves.toEqual(serie);
    expect(prisma.serie.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: dto,
    });
  });

  it('should remove a serie', async () => {
    await expect(service.remove(1)).resolves.toEqual(serie);
    expect(prisma.serie.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
