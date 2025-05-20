import { AnalysisService } from './analysis.service';
import { CreateAnalysisDto, UpdateAnalysisDto } from './dto';
import { Analysis } from '@shared/models';
export declare class AnalysisController {
    private readonly analysisService;
    constructor(analysisService: AnalysisService);
    createAnalysis(createAnalysisDto: CreateAnalysisDto, req: any): Promise<Analysis>;
    findAllUserAnalyses(req: any): Promise<Analysis[]>;
    findOneUserAnalysis(id: string, req: any): Promise<Analysis>;
    updateCurrentUserAnalysis(id: string, req: any, updateAnalysisDto: UpdateAnalysisDto): Promise<Analysis>;
    deleteCurrentUserAnalysis(id: string, req: any): Promise<void>;
    createAnalysisFromOcr(file: Express.Multer.File, body: Partial<CreateAnalysisDto>, req: any): Promise<Analysis>;
}
