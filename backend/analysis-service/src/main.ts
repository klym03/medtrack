import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Додаємо глобальний ValidationPipe, якщо ще не зроблено в AuthController для кожного методу
  // import { ValidationPipe } from '@nestjs/common';
  // app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  await app.listen(process.env.ANALYSIS_SERVICE_PORT || 3001);
  console.log(`Analysis service is running on: ${await app.getUrl()}`);
}
bootstrap();
