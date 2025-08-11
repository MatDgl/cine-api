import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { SerieService } from './serie.service';
import { CreateSerieDto } from './dto/create-serie.dto';
import { UpdateSerieDto } from './dto/update-serie.dto';
import { Serie } from '@prisma/client';

@Controller('serie')
export class SerieController {
  constructor(private readonly serieService: SerieService) {}

  @Post()
  create(@Body() createSerieDto: CreateSerieDto): Promise<Serie> {
    return this.serieService.create(createSerieDto);
  }

  @Get()
  findAll(): Promise<Serie[]> {
    return this.serieService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Serie | null> {
    return this.serieService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateSerieDto: UpdateSerieDto,
  ): Promise<Serie> {
    return this.serieService.update(+id, updateSerieDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Serie> {
    return this.serieService.remove(+id);
  }
}
