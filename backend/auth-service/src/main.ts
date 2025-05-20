import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Автоматично видаляє властивості, яких немає в DTO
    forbidNonWhitelisted: true, // Кидає помилку, якщо є зайві властивості
    transform: true, // Автоматично трансформує payload до типів DTO (наприклад, string в number)
    // transformOptions: { enableImplicitConversion: true }, // Якщо потрібна неявна конвертація типів
  }));

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
