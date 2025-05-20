import { CreateIndicatorDto } from './create-indicator.dto';
export declare class CreateAnalysisDto {
    filename?: string | null;
    documentType?: string | null;
    analysisDate?: string | null;
    rawResultText?: string | null;
    indicators?: CreateIndicatorDto[];
    structuredReportData?: Record<string, any> | null;
}
