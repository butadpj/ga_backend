import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { config } from 'aws-sdk';

async function bootstrap() {
  const port = process.env.PORT;
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: [process.env.CLIENT_HOST],
  });
  config.update({
    accessKeyId: process.env.STORAGE_ACCESS_KEY,
    secretAccessKey: process.env.STORAGE_SECRET_KEY,
    region: process.env.BUCKET_REGION,
  });
  await app.listen(port);

  Logger.log(`Server started running on http://localhost:${port}`, 'Backend');
}
bootstrap();
