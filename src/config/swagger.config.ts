import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export function swagger(app: INestApplication): string {
  const swaggerPath = 'documentation';

  const config = new DocumentBuilder()
    .setTitle('Vinyl API')
    .setDescription('The vinyl API description')
    .setVersion('1.0')
    .addTag('vinyl')
    .addBearerAuth( 
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'jwt-auth', 
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerPath, app, document);

  return swaggerPath;
}
