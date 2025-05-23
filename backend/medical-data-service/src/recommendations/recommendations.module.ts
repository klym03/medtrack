import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recommendation } from './entities/recommendation.entity';
import { RecommendationService } from './recommendations.service';
import { RecommendationController } from './recommendations.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recommendation]), // Реєструємо сутність Recommendation
  ],
  controllers: [RecommendationController], // Додаємо контролер
  providers: [RecommendationService],   // Додаємо сервіс
  exports: [RecommendationService] // Експортуємо сервіс, якщо він буде потрібен в інших модулях цього ж додатку
})
export class RecommendationModule {} 