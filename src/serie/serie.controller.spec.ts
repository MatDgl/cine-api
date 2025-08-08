import { Test, TestingModule } from '@nestjs/testing';
import { SerieController } from './serie.controller';
import { SerieService } from './serie.service';

describe('SerieController', () => {
  let controller: SerieController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SerieController],
      providers: [SerieService],
    }).compile();

    controller = module.get<SerieController>(SerieController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
