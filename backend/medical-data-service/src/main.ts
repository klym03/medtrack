import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap - MedicalDataService');

  // Глобальний префікс для всіх маршрутів у цьому сервісі (опціонально)
  // app.setGlobalPrefix('api/v1/data'); // Приклад

  // Глобальні pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Автоматично видаляти властивості, яких немає в DTO
      forbidNonWhitelisted: true, // Кидати помилку, якщо є зайві властивості
      transform: true, // Автоматично перетворювати типи (наприклад, string з query params в number)
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Налаштування CORS (якщо потрібно для прямого доступу, а не тільки через API Gateway)
  app.enableCors(); // Або більш детальні налаштування: app.enableCors({ origin: 'http://localhost:your_frontend_port' });

  const port = process.env.MEDICAL_DATA_SERVICE_PORT || 3003; // Приклад порту, можна брати з .env
  await app.listen(port);
  logger.log(`MedicalDataService is running on: ${await app.getUrl()}`);
}
bootstrap(); 