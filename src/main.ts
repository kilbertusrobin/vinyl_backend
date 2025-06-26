import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { swagger } from './config/swagger.config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { json } from 'express';
import * as dotenv from 'dotenv';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(json());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, 
      whitelist: true,
    }),
  );
  app.setGlobalPrefix('api');

  /*
  app.use('/payments/webhook', json({ 
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    }
  }));
*/
  const swaggerPath = swagger(app);
  const port = process.env.PORT ?? 3000;
  
  dotenv.config();

  await app.listen(port);
  Logger.log(
    `Documentation is available at http://localhost:${port}/${swaggerPath}`,
    'Swagger',
  );
}
bootstrap();
