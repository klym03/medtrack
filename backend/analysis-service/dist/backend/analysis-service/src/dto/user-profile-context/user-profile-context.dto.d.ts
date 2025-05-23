declare class LastBpDto {
    systolic?: number | null;
    diastolic?: number | null;
    timestamp?: string | null;
}
declare class AnalysisSummaryItemDto {
    id: number | string;
    type?: string | null;
    analysis_date?: string | null;
    uploaded?: string | null;
    filename?: string | null;
    raw_result_text?: string | null;
}
export declare class UserProfileContextResponseDto {
    name?: string | null;
    email?: string | null;
    age?: number | null;
    sex?: string | null;
    height_cm?: number | null;
    weight_kg?: number | null;
    bmi?: number | null;
    is_smoker?: string | null;
    usual_systolic?: number | null;
    usual_diastolic?: number | null;
    last_bp?: LastBpDto;
    indicators_summary?: string | null;
    chronic_conditions?: string | null;
    current_medications?: string | null;
    all_indicators_summary?: string | null;
    all_analyses?: AnalysisSummaryItemDto[];
}
export {};
