import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
config();
import * as express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({ origin: '*' });
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  await app.listen(process.env.PORT ?? 8000);
  console.log(`Server started on PORT ${process.env.PORT}`);
}
bootstrap();
