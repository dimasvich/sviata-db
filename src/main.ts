import { config } from 'dotenv';
config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({ origin: '*' });
  await app.listen(process.env.PORT ?? 8000);
  console.log(`Server started on PORT ${process.env.PORT}`);
}
bootstrap();
