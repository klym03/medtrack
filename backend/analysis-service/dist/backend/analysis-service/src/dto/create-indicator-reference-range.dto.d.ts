import { SexConstraint } from '@shared/models';
export declare class CreateIndicatorReferenceRangeDto {
    indicatorName: string;
    units: string;
    sexConstraint?: SexConstraint;
    ageMinYears?: number | null;
    ageMaxYears?: number | null;
    normalLow?: number | null;
    normalHigh?: number | null;
    textualRange?: string | null;
    source?: string | null;
}
