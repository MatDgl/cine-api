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

  findAll(): Promise<Movie[]> {
    return this.prisma.movie.findMany();
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
