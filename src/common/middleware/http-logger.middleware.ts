import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const start = process.hrtime.bigint();

    res.on('finish', () => {
      const end = process.hrtime.bigint();
      const durationMs = Number(end - start) / 1_000_000; // ns -> ms
      const statusCode = res.statusCode;
      const contentLength = res.getHeader('content-length');
      const contentLengthStr = Array.isArray(contentLength)
        ? contentLength.join(',')
        : ((contentLength ?? '-') as string);
      const ua = req.headers['user-agent'] || '';
      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${contentLengthStr} - ${durationMs.toFixed(
          1,
        )}ms ${ua}`,
      );
    });

    next();
  }
}
