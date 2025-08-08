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

  findAll(): Promise<Serie[]> {
    return this.prisma.serie.findMany();
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
