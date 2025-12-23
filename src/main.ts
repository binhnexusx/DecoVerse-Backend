import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Config
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3001;

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS (cho frontend gọi)
  app.enableCors({
    origin: '*', // sau này restrict domain
  });

  // Validation DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('DecoVerse API')
    .setDescription('Backend API for DecoVerse')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
  console.log(`🚀 DecoVerse API running on http://localhost:${port}/api`);
}

bootstrap();
