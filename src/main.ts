import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsEnv = process.env.CORS_ALLOWED_ORIGINS;
  let corsOrigin: string | RegExp | (string | RegExp)[];

  if (corsEnv && corsEnv.startsWith('/') && corsEnv.endsWith('/')) {
    // RegExp
    corsOrigin = new RegExp(corsEnv.slice(1, -1));
  } else if (corsEnv) {
    corsOrigin = corsEnv.split(',').map((s) => s.trim());
  } else {
    corsOrigin = [];
  }

  app.enableCors({
    origin: corsOrigin,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
