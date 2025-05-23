import { UpdateIndicatorDto } from './update-indicator.dto';
export declare class UpdateAnalysisDto {
    filename?: string | null;
    documentType?: string | null;
    analysisDate?: string | null;
    rawResultText?: string | null;
    indicators?: UpdateIndicatorDto[];
    structuredReportData?: Record<string, any> | null;
}
