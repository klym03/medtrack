export declare class Recommendation {
    id: string;
    title: string;
    slug: string;
    shortDescription: string | null;
    fullContent: string;
    tags: string[] | null;
    targetSex: 'male' | 'female' | 'any' | null;
    targetAgeMin: number | null;
    targetAgeMax: number | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
