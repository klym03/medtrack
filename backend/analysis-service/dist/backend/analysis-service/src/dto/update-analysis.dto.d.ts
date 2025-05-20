import { CreateIndicatorDto } from './create-indicator.dto';
export declare class UpdateAnalysisDto {
    filename?: string | null;
    documentType?: string | null;
    analysisDate?: string | null;
    rawResultText?: string | null;
    indicators?: CreateIndicatorDto[];
    structuredReportData?: Record<string, any> | null;
}
