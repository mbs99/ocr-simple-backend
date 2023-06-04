import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { unlink } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // automatically deletes uploaded files when express finishes the request
  app.use(function (req, res, next) {
    const writeHead = res.writeHead;
    const writeHeadbound = writeHead.bind(res);
    res.writeHead = function (statusCode, statusMessage, headers) {
      if (req.files) {
        for (const file of req.files) {
          unlink(file.path, function (err) {
            if (err) console.error(err);
          });
        }
      }

      writeHeadbound(statusCode, statusMessage, headers);
    };

    next();
  });

  await app.listen(3000);
}
bootstrap();
