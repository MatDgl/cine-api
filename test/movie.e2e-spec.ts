import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { Server } from 'http';
import { AppModule } from '../src/app.module';
import type { Movie } from '@prisma/client';

describe('Movie E2E', () => {
  let app: INestApplication;
  let server: Server;
  let createdId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /movie should create a movie', async () => {
    const data = { title: 'E2E Movie', rating: 4, wishlist: false };
    const res = await request(server).post('/movie').send(data).expect(201);

    const body = res.body as Movie;

    expect(body).toMatchObject(data);
    expect(typeof body.id).toBe('number');
    createdId = body.id;
  });

  it('GET /movie should list movies (contains created)', async () => {
    const res = await request(server).get('/movie').expect(200);
    const list = res.body as Movie[];
    const found = list.find((m) => m.id === createdId);
    expect(found).toBeTruthy();
  });

  it('GET /movie/:id should return created movie', async () => {
    const res = await request(server).get(`/movie/${createdId}`).expect(200);
    const body = res.body as Movie;
    expect(body).toMatchObject({ id: createdId, title: 'E2E Movie' });
  });

  it('PUT /movie/:id should update movie fully', async () => {
    const data = { title: 'E2E Movie Updated', wishlist: true };
    const res = await request(server)
      .put(`/movie/${createdId}`)
      .send(data)
      .expect(200);

    const body = res.body as Movie;
    expect(body).toMatchObject(data);
  });

  it('DELETE /movie/:id should delete movie', async () => {
    const res = await request(server).delete(`/movie/${createdId}`).expect(200);
    const body = res.body as Movie;
    expect(body).toMatchObject({ id: createdId });
  });
});
