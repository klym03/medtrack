import { Repository } from 'typeorm';
import { Recommendation } from './entities/recommendation.entity';
export declare class RecommendationService {
    private readonly recommendationRepository;
    constructor(recommendationRepository: Repository<Recommendation>);
    findAllActive(): Promise<Recommendation[]>;
    findBySlug(slug: string): Promise<Recommendation | null>;
}
