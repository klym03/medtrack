export declare enum SexConstraint {
    ANY = "any",
    MALE = "male",
    FEMALE = "female"
}
export declare class IndicatorReferenceRange {
    id: string;
    indicatorName: string;
    units: string;
    sexConstraint: SexConstraint;
    ageMinYears: number | null;
    ageMaxYears: number | null;
    normalLow: number | null;
    normalHigh: number | null;
    textualRange: string | null;
    source: string | null;
}
