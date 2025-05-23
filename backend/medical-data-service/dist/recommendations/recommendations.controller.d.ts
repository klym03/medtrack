import { RecommendationService } from './recommendations.service';
import { Recommendation } from './entities/recommendation.entity';
export declare class RecommendationController {
    private readonly recommendationService;
    constructor(recommendationService: RecommendationService);
    findAllActive(): Promise<Recommendation[]>;
    findBySlug(slug: string): Promise<Recommendation>;
}
