import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: '*', // En producción dinámico por tenant domains permitidos
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    },
  });

  // Prefijo global de API
  app.setGlobalPrefix('api');

  // Versionamiento de API (ej: /api/v1/...)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remueve propiedades no decoradas en los DTOs
      forbidNonWhitelisted: true, // Lanza error si envían propiedades basura
      transform: true, // Auto-transforma tipos (ej: strings a números/booleanos cuando corresponda)
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Academina Backend is running on: http://localhost:${port}/api/v1`);
}
bootstrap();
