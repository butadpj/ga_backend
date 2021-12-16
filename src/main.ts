import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const port = process.env.PORT;
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://staging-game-antena-client.vercel.app',
    ],
  });
  await app.listen(port);

  Logger.log(`Server started running on http://localhost:${port}`, 'Backend');
}
bootstrap();
