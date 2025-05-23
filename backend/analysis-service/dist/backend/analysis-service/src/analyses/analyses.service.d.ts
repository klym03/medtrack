import { Repository } from 'typeorm';
import { Analysis, Indicator, BloodPressureReading } from '@shared/models';
import { CreateAnalysisDto, UpdateAnalysisDto, CreateBloodPressureDto } from '../dto';
import { ConfigService } from '@nestjs/config';
export interface KeyIndicatorItem {
    name: string;
    value: string | null;
    units: string | null;
    referenceRange: string | null;
    analysisDate: string | null;
    analysisId: string;
}
export interface RecentAnalysisItem {
    id: string;
    documentType: string | null;
    analysisDate: string | null;
    uploadTimestamp: Date;
    originalName: string | null;
}
export interface DashboardSummaryResponse {
    lastBloodPressure: BloodPressureReading | null;
    recentAnalyses: RecentAnalysisItem[];
    keyIndicators: KeyIndicatorItem[];
}
export interface IndicatorHistoryItem {
    analysisDate: string | null;
    uploadTimestamp: Date;
    value: string | null;
    units: string | null;
    referenceRange: string | null;
    structuredReferenceRange?: {
        normalLow: number | null;
        normalHigh: number | null;
        textualRange: string | null;
        source?: string | null;
    } | null;
    analysisId: string;
}
interface CreateAnalysisFromUploadData {
    userId: string;
    originalName: string | null;
    savedFilename: string;
    mimeType: string;
    size: number;
    documentType: 'indicators' | 'descriptive' | null;
    extractedTextPreview: string | null;
    structuredData: any | null;
    analysisDate?: string | null;
}
export declare class AnalysesService {
    private readonly analysisRepository;
    private readonly indicatorRepository;
    private readonly bloodPressureRepository;
    private readonly configService;
    private readonly logger;
    private openai;
    private userRepository;
    constructor(analysisRepository: Repository<Analysis>, indicatorRepository: Repository<Indicator>, bloodPressureRepository: Repository<BloodPressureReading>, configService: ConfigService);
    createAnalysisFromUpload(data: CreateAnalysisFromUploadData): Promise<Analysis>;
    create(createAnalysisDto: CreateAnalysisDto, userId: string): Promise<Analysis>;
    findAllByUser(userId: string): Promise<Analysis[]>;
    findOne(id: string, userId: string): Promise<Analysis>;
    update(id: string, updateAnalysisDto: UpdateAnalysisDto, userId: string): Promise<Analysis>;
    remove(id: string, userId: string): Promise<void>;
    structureTextWithOpenAI(text: string, documentType: 'indicators' | 'descriptive'): Promise<any | null>;
    extractTextFromPdf(filePath: string): Promise<string>;
    extractTextFromImage(filePath: string): Promise<string>;
    findAllUniqueIndicatorNamesByUser(userId: string): Promise<string[]>;
    findIndicatorHistoryByUser(userId: string, indicatorName: string): Promise<IndicatorHistoryItem[]>;
    createBloodPressureReading(userId: string, dto: CreateBloodPressureDto): Promise<BloodPressureReading>;
    getBloodPressureReadingsForUser(userId: string): Promise<BloodPressureReading[]>;
    getDashboardSummary(userId: string): Promise<DashboardSummaryResponse>;
}
export {};
