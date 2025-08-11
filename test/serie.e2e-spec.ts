import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { Server } from 'http';
import { AppModule } from '../src/app.module';
import type { Serie } from '@prisma/client';

describe('Serie E2E', () => {
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

  it('POST /serie should create a serie', async () => {
    const data = { title: 'E2E Serie', rating: 9, wishlist: false };
    const res = await request(server).post('/serie').send(data).expect(201);

    const body = res.body as Serie;
    expect(body).toMatchObject(data);
    expect(typeof body.id).toBe('number');
    createdId = body.id;
  });

  it('GET /serie should list series (contains created)', async () => {
    const res = await request(server).get('/serie').expect(200);
    const list = res.body as Serie[];
    const found = list.find((s) => s.id === createdId);
    expect(found).toBeTruthy();
  });

  it('GET /serie/:id should return created serie', async () => {
    const res = await request(server).get(`/serie/${createdId}`).expect(200);
    const body = res.body as Serie;
    expect(body).toMatchObject({ id: createdId, title: 'E2E Serie' });
  });

  it('PUT /serie/:id should update serie fully', async () => {
    const data = { title: 'E2E Serie Updated', wishlist: true };
    const res = await request(server)
      .put(`/serie/${createdId}`)
      .send(data)
      .expect(200);

    const body = res.body as Serie;
    expect(body).toMatchObject(data);
  });

  it('DELETE /serie/:id should delete serie', async () => {
    const res = await request(server).delete(`/serie/${createdId}`).expect(200);
    const body = res.body as Serie;
    expect(body).toMatchObject({ id: createdId });
  });
});
