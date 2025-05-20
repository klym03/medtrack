import { Analysis } from './analysis.entity';
export declare class Indicator {
    id: string;
    analysisId: string;
    analysis: Analysis;
    name: string;
    value: string | null;
    units: string | null;
    referenceRange: string | null;
}
