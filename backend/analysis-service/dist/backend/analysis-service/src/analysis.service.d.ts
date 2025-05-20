import { Repository } from 'typeorm';
import { Analysis, Indicator, User } from '@shared/models';
import { CreateAnalysisDto, UpdateAnalysisDto, CreateIndicatorDto } from './dto';
interface OcrResult {
    text: string;
    parsedIndicators: CreateIndicatorDto[];
    descriptiveData?: Record<string, any>;
}
export declare class AnalysisService {
    private readonly analysisRepository;
    private readonly indicatorRepository;
    private readonly userRepository;
    private openai;
    constructor(analysisRepository: Repository<Analysis>, indicatorRepository: Repository<Indicator>, userRepository: Repository<User>);
    createAnalysis(createAnalysisDto: CreateAnalysisDto, userId: string): Promise<Analysis>;
    findAllByUserId(userId: string): Promise<Analysis[]>;
    findOneById(id: string, userId: string): Promise<Analysis | null>;
    updateAnalysis(id: string, userId: string, updateAnalysisDto: UpdateAnalysisDto): Promise<Analysis | null>;
    deleteAnalysis(id: string, userId: string): Promise<{
        deleted: boolean;
        id: string;
    }>;
    private _recognizeTextFromImageBuffer;
    performOcr(originalFileBuffer: Buffer, mimetype: string, documentType: string, originalFilename: string): Promise<OcrResult>;
}
export {};
