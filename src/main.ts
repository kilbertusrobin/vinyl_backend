import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { swagger } from './config/swagger.config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const swaggerPath = swagger(app);
  const port = process.env.PORT ?? 3000;

  await app.listen(port);
  Logger.log(
    `Documentation is available at http://localhost:${port}/${swaggerPath}`,
    'Swagger',
  );
}
bootstrap();
