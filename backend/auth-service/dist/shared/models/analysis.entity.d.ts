import { User } from './user.entity';
import { Indicator } from './indicator.entity';
export declare class Analysis {
    id: string;
    userId: string;
    user: User;
    filename: string | null;
    uploadTimestamp: Date;
    documentType: string | null;
    analysisDate: string | null;
    rawResultText: string | null;
    indicators: Indicator[];
    structuredReportData: Record<string, any> | null;
}
