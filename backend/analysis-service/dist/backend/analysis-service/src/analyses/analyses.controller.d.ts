import { AnalysesService } from './analyses.service';
import { CreateAnalysisDto } from '../dto/create-analysis.dto';
import { UpdateAnalysisDto } from '../dto/update-analysis.dto';
import { CreateBloodPressureDto } from '../dto';
import { BloodPressureReading } from '@shared/models';
import { DashboardSummaryResponse } from './analyses.service';
export declare class AnalysesController {
    private readonly analysesService;
    private readonly logger;
    constructor(analysesService: AnalysesService);
    pingAnalyses(): {
        message: string;
    };
    create(createAnalysisDto: CreateAnalysisDto, req: any): Promise<import("@shared/models").Analysis>;
    uploadFile(file: Express.Multer.File, req: any, body: {
        documentType?: 'indicators' | 'descriptive';
    }): Promise<import("@shared/models").Analysis>;
    findAll(req: any): Promise<import("@shared/models").Analysis[]>;
    findOne(id: string, req: any): Promise<import("@shared/models").Analysis>;
    update(id: string, updateAnalysisDto: UpdateAnalysisDto, req: any): Promise<import("@shared/models").Analysis>;
    remove(id: string, req: any): Promise<void>;
    findAllUniqueIndicatorNames(req: any): Promise<string[]>;
    findIndicatorHistory(req: any, indicatorName: string): Promise<import("./analyses.service").IndicatorHistoryItem[]>;
    createBloodPressureReading(req: any, dto: CreateBloodPressureDto): Promise<BloodPressureReading>;
    getBloodPressureReadings(req: any): Promise<BloodPressureReading[]>;
    getDashboardSummary(req: any): Promise<DashboardSummaryResponse>;
}
