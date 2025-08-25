import { NestFactory } from '@nestjs/core';
import 'dotenv/config';
import { ProxyAgent, setGlobalDispatcher } from 'undici';
import { AppModule } from './app.module';

// Configure un proxy global pour fetch si défini dans l'environnement
(() => {
  const proxyUrl =
    process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.ALL_PROXY;
  if (proxyUrl) {
    try {
      setGlobalDispatcher(new ProxyAgent(proxyUrl));
      const masked = proxyUrl.replace(
        /(https?:\/\/)([^:@]*):[^@]*@/,
        '$1$2:***@',
      );
      console.log(`[network] Proxy sortant activé: ${masked}`);
      if (process.env.NO_PROXY) {
        console.log(`[network] NO_PROXY: ${process.env.NO_PROXY}`);
      }
    } catch (e) {
      console.warn('[network] Échec configuration du proxy sortant:', e);
    }
  }
})();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuration du préfixe global pour toutes les routes
  app.setGlobalPrefix('api');

  const corsEnv = process.env.CORS_ALLOWED_ORIGINS;
  let corsOrigin: string | RegExp | (string | RegExp)[] | boolean;

  if (corsEnv && corsEnv.startsWith('/') && corsEnv.endsWith('/')) {
    // RegExp
    corsOrigin = new RegExp(corsEnv.slice(1, -1));
  } else if (corsEnv) {
    corsOrigin = corsEnv.split(',').map((s) => s.trim());
  } else {
    // En développement, autoriser toutes les origines localhost
    corsOrigin = process.env.NODE_ENV === 'production' ? false : true;
  }

  app.enableCors({
    origin: corsOrigin,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: false,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 API accessible sur: http://localhost:${port}/api`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
