import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm'; // Розкоментуємо
import { RecommendationModule } from './recommendations/recommendations.module'; // Імпортуємо RecommendationModule
import { join } from 'path'; // Імпортуємо join
import { Recommendation } from './recommendations/entities/recommendation.entity'; // <--- ДОДАНО ЯВНИЙ ІМПОРТ
// import { RecommendationModule } from './recommendations/recommendations.module'; // Приклад майбутнього модуля

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Робить конфігурацію доступною глобально
      envFilePath: '../../.env', // Вказуємо шлях до єдиного .env файлу
    }),
    TypeOrmModule.forRootAsync({ // Конфігурація TypeORM з використанням DATABASE_URL
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        if (!databaseUrl) {
          throw new Error('DATABASE_URL environment variable is not set.');
        }
        return {
          type: 'postgres',
          url: databaseUrl,
          entities: [Recommendation], // <--- ЗМІНЕНО: ЯВНО ВКАЗУЄМО СУТНОСТІ
          synchronize: configService.get<string>('NODE_ENV') !== 'production', // true тільки для розробки
          // ssl: configService.get<string>('NODE_ENV') === 'production' 
          //   ? { rejectUnauthorized: false } // Налаштування SSL для продакшену, якщо потрібно
          //   : undefined,
          logging: configService.get<string>('NODE_ENV') !== 'production' ? ['query', 'error'] : ['error'], // Логування запитів в розробці
        };
      },
      inject: [ConfigService],
    }),
    RecommendationModule, // Додаємо RecommendationModule до імпортів
    // RecommendationModule, // Приклад підключення модуля рекомендацій
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {} 