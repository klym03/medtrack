import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { RecommendationService } from './recommendations.service';
import { Recommendation } from './entities/recommendation.entity';

@Controller('recommendations') // Базовий шлях для всіх ендпоінтів цього контролера
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Get()
  async findAllActive(): Promise<Recommendation[]> {
    return this.recommendationService.findAllActive();
  }

  @Get(':slug') // Динамічний параметр :slug
  async findBySlug(@Param('slug') slug: string): Promise<Recommendation> {
    const recommendation = await this.recommendationService.findBySlug(slug);
    // NotFoundException вже обробляється в сервісі, тому тут можна просто повернути результат
    // Але для більшої ясності можна було б перехопити помилку і тут, якщо потрібно
    return recommendation; 
  }
} 