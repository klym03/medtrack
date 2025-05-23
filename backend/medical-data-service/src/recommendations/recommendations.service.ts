import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recommendation } from './entities/recommendation.entity';

@Injectable()
export class RecommendationService {
  constructor(
    @InjectRepository(Recommendation)
    private readonly recommendationRepository: Repository<Recommendation>,
  ) {}

  async findAllActive(): Promise<Recommendation[]> {
    return this.recommendationRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' }, // Або за іншим полем, наприклад, title
    });
  }

  async findBySlug(slug: string): Promise<Recommendation | null> {
    const recommendation = await this.recommendationRepository.findOne({
      where: { slug, isActive: true },
    });
    if (!recommendation) {
      throw new NotFoundException(`Recommendation with slug "${slug}" not found or not active.`);
    }
    return recommendation;
  }

  // Майбутні методи для створення/оновлення/видалення рекомендацій (якщо потрібно через API)
  // async create(createRecommendationDto: any): Promise<Recommendation> { ... }
  // async update(id: string, updateRecommendationDto: any): Promise<Recommendation> { ... }
  // async remove(id: string): Promise<void> { ... }
} 