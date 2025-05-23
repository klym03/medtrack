"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AnalysesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const models_1 = require("@shared/models");
const fs = require("fs");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
const tesseract_js_1 = require("tesseract.js");
const openai_1 = require("openai");
const prompts_1 = require("./prompts");
const config_1 = require("@nestjs/config");
const extractAnalysisDateFromText = (text) => {
    if (!text)
        return null;
    const patterns = [
        { regex: /\b(\d{4})[-.\/](\d{1,2})[-.\/](\d{1,2})\b/, yearIndex: 1, monthIndex: 2, dayIndex: 3 },
        { regex: /\b(\d{1,2})[-.\/](\d{1,2})[-.\/](\d{4})\b/, yearIndex: 3, monthIndex: 2, dayIndex: 1 }
    ];
    for (const pattern of patterns) {
        const match = pattern.regex.exec(text);
        if (match) {
            try {
                const year = parseInt(match[pattern.yearIndex], 10);
                const month = parseInt(match[pattern.monthIndex], 10);
                const day = parseInt(match[pattern.dayIndex], 10);
                if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                }
            }
            catch (e) {
            }
        }
    }
    return null;
};
let AnalysesService = AnalysesService_1 = class AnalysesService {
    constructor(analysisRepository, indicatorRepository, bloodPressureRepository, configService) {
        this.analysisRepository = analysisRepository;
        this.indicatorRepository = indicatorRepository;
        this.bloodPressureRepository = bloodPressureRepository;
        this.configService = configService;
        this.logger = new common_1.Logger(AnalysesService_1.name);
        const apiKey = this.configService.get('OPENAI_API_KEY');
        if (!apiKey) {
            this.logger.error('OPENAI_API_KEY is not configured! OpenAI features will be disabled.');
        }
        else {
            this.openai = new openai_1.OpenAI({ apiKey });
            this.logger.log('OpenAI client initialized successfully.');
        }
    }
    async createAnalysisFromUpload(data) {
        this.logger.log(`Creating analysis from upload for user ID: ${data.userId}, filename: ${data.savedFilename}, document type: ${data.documentType}`);
        let determinedAnalysisDate = data.analysisDate;
        if (!determinedAnalysisDate && data.extractedTextPreview) {
            this.logger.log(`Analysis date not provided, attempting to extract from text for file: ${data.savedFilename}`);
            determinedAnalysisDate = extractAnalysisDateFromText(data.extractedTextPreview);
            if (determinedAnalysisDate) {
                this.logger.log(`Successfully extracted analysis date: ${determinedAnalysisDate} for file: ${data.savedFilename}`);
            }
            else {
                this.logger.log(`Could not extract analysis date from text for file: ${data.savedFilename}`);
            }
        }
        const newAnalysisEntity = this.analysisRepository.create({
            userId: data.userId,
            filename: data.savedFilename,
            originalName: data.originalName,
            mimeType: data.mimeType,
            size: data.size,
            uploadTimestamp: new Date(),
            documentType: data.documentType,
            rawResultText: data.extractedTextPreview,
            structuredReportData: data.documentType !== 'indicators' ? data.structuredData : null,
            analysisDate: determinedAnalysisDate,
        });
        let savedAnalysis = await this.analysisRepository.save(newAnalysisEntity);
        this.logger.log(`Saved base analysis from upload with ID: ${savedAnalysis.id}. Document type: ${data.documentType}`);
        if (data.documentType === 'indicators' && data.structuredData && Array.isArray(data.structuredData.показники)) {
            this.logger.log(`Processing ${data.structuredData.показники.length} indicators for analysis ID: ${savedAnalysis.id}`);
            const indicatorsToCreateDto = data.structuredData.показники.map(ind => ({
                name: ind.назва,
                value: String(ind.значення),
                units: ind.одиниці,
                referenceRange: ind.референс,
            }));
            if (indicatorsToCreateDto.length > 0) {
                const createdIndicators = [];
                for (const indicatorDto of indicatorsToCreateDto) {
                    const newIndicatorEntity = this.indicatorRepository.create({
                        ...indicatorDto,
                        analysis: savedAnalysis,
                        analysisId: savedAnalysis.id
                    });
                    const savedIndicator = await this.indicatorRepository.save(newIndicatorEntity);
                    createdIndicators.push(savedIndicator);
                }
                this.logger.log(`Saved ${createdIndicators.length} indicators for analysis ID: ${savedAnalysis.id}.`);
                const reloadedAnalysisWithIndicators = await this.analysisRepository.findOne({
                    where: { id: savedAnalysis.id },
                    relations: ['indicators', 'user'],
                });
                if (!reloadedAnalysisWithIndicators) {
                    this.logger.error(`Failed to reload analysis ID ${savedAnalysis.id} after saving indicators.`);
                    throw new common_1.InternalServerErrorException('Failed to reload analysis after saving indicators');
                }
                this.logger.log(`Successfully reloaded analysis ID ${savedAnalysis.id} with ${reloadedAnalysisWithIndicators.indicators?.length || 0} indicators.`);
                return reloadedAnalysisWithIndicators;
            }
        }
        else if (data.documentType === 'indicators') {
            this.logger.log(`Document type is 'indicators' but no valid 'показники' array found in structuredData for analysis ID: ${savedAnalysis.id}. Proceeding without creating indicators.`);
        }
        const reloadedAnalysis = await this.analysisRepository.findOne({
            where: { id: savedAnalysis.id },
            relations: ['indicators', 'user'],
        });
        if (!reloadedAnalysis) {
            this.logger.error(`Failed to reload analysis ID ${savedAnalysis.id} (non-indicator path or empty indicators).`);
            throw new common_1.InternalServerErrorException('Failed to reload analysis');
        }
        return reloadedAnalysis;
    }
    async create(createAnalysisDto, userId) {
        this.logger.log(`Attempting to create analysis for user ID: ${userId} using generic create`);
        const { indicators, ...analysisData } = createAnalysisDto;
        const newAnalysisEntity = this.analysisRepository.create({
            ...analysisData,
            userId: userId,
        });
        let savedAnalysis = await this.analysisRepository.save(newAnalysisEntity);
        this.logger.log(`Saved base analysis with ID: ${savedAnalysis.id}`);
        if (indicators && indicators.length > 0) {
            await Promise.all(indicators.map(async (indicatorDto) => {
                const newIndicatorEntity = this.indicatorRepository.create({
                    ...indicatorDto,
                    analysisId: savedAnalysis.id,
                });
                return this.indicatorRepository.save(newIndicatorEntity);
            }));
            this.logger.log(`Saved ${indicators.length} indicators for analysis ID: ${savedAnalysis.id}`);
            const reloadedAnalysis = await this.analysisRepository.findOne({
                where: { id: savedAnalysis.id },
                relations: ['indicators', 'user'],
            });
            if (!reloadedAnalysis) {
                this.logger.error(`Failed to reload analysis ID ${savedAnalysis.id} after saving indicators in generic create.`);
                throw new common_1.InternalServerErrorException('Failed to reload analysis after saving indicators in generic create');
            }
            savedAnalysis = reloadedAnalysis;
        }
        else {
            const reloadedAnalysis = await this.analysisRepository.findOne({
                where: { id: savedAnalysis.id },
                relations: ['indicators', 'user'],
            });
            if (!reloadedAnalysis) {
                this.logger.error(`Failed to reload analysis ID ${savedAnalysis.id} in generic create (no indicators).`);
                throw new common_1.InternalServerErrorException('Failed to reload analysis in generic create (no indicators).');
            }
            savedAnalysis = reloadedAnalysis;
        }
        return savedAnalysis;
    }
    async findAllByUser(userId) {
        this.logger.log(`Finding all analyses for user ID: ${userId}`);
        return this.analysisRepository.find({
            where: { userId },
            relations: ['indicators', 'user'],
        });
    }
    async findOne(id, userId) {
        this.logger.log(`Finding analysis with ID: ${id} for user ID: ${userId}`);
        const analysis = await this.analysisRepository.findOne({
            where: { id, userId },
            relations: ['indicators', 'user'],
        });
        if (!analysis) {
            this.logger.warn(`Analysis with ID "${id}" not found for user ID "${userId}".`);
            throw new common_1.NotFoundException(`Analysis with ID "${id}" not found for this user.`);
        }
        return analysis;
    }
    async update(id, updateAnalysisDto, userId) {
        this.logger.log(`Attempting to update analysis ID: ${id} for user ID: ${userId}`);
        const existingAnalysis = await this.analysisRepository.findOne({
            where: { id, userId },
            relations: ['indicators']
        });
        if (!existingAnalysis) {
            this.logger.warn(`Update failed: Analysis with ID "${id}" not found for user ID "${userId}".`);
            throw new common_1.NotFoundException(`Analysis with ID "${id}" not found for this user.`);
        }
        const { indicators: indicatorDtos, ...analysisDataToUpdate } = updateAnalysisDto;
        await this.analysisRepository.update(existingAnalysis.id, analysisDataToUpdate);
        this.logger.log(`Updated base analysis properties for ID: ${existingAnalysis.id}`);
        if (indicatorDtos) {
            this.logger.log(`Processing ${indicatorDtos.length} indicators for update on analysis ID: ${id}`);
            const currentIndicators = existingAnalysis.indicators || [];
            const processedIndicatorIds = new Set();
            for (const indicatorDto of indicatorDtos) {
                if (indicatorDto.id) {
                    const indicatorToUpdate = currentIndicators.find(ind => ind.id === indicatorDto.id);
                    if (indicatorToUpdate) {
                        await this.indicatorRepository.update(indicatorDto.id, {
                            name: indicatorDto.name,
                            value: indicatorDto.value,
                            units: indicatorDto.units,
                            referenceRange: indicatorDto.referenceRange
                        });
                        processedIndicatorIds.add(indicatorDto.id);
                        this.logger.log(`Updated indicator ID: ${indicatorDto.id}`);
                    }
                    else {
                        this.logger.warn(`Indicator with ID ${indicatorDto.id} from DTO not found in existing analysis ${id}, skipping update.`);
                    }
                }
                else {
                    const newIndicatorEntity = this.indicatorRepository.create({
                        ...indicatorDto,
                        analysisId: existingAnalysis.id,
                    });
                    const savedNewIndicator = await this.indicatorRepository.save(newIndicatorEntity);
                    processedIndicatorIds.add(savedNewIndicator.id);
                    this.logger.log(`Created new indicator with ID: ${savedNewIndicator.id} for analysis ${id}`);
                }
            }
            const indicatorsToDelete = currentIndicators.filter(ind => ind.id && !processedIndicatorIds.has(ind.id));
            if (indicatorsToDelete.length > 0) {
                await this.indicatorRepository.remove(indicatorsToDelete);
                this.logger.log(`Removed ${indicatorsToDelete.length} indicators not present in update DTO for analysis ${id}.`);
            }
        }
        const reloadedAnalysis = await this.analysisRepository.findOne({
            where: { id: existingAnalysis.id, userId },
            relations: ['indicators', 'user'],
        });
        if (!reloadedAnalysis) {
            this.logger.error(`Analysis with ID "${id}" could not be reloaded after update.`);
            throw new common_1.NotFoundException(`Analysis with ID "${id}" could not be reloaded after update.`);
        }
        this.logger.log(`Finished updating analysis ID: ${id}.`);
        return reloadedAnalysis;
    }
    async remove(id, userId) {
        this.logger.log(`Attempting to remove analysis ID: ${id} for user ID: ${userId}`);
        const analysisToRemove = await this.findOne(id, userId);
        await this.analysisRepository.remove(analysisToRemove);
        this.logger.log(`Successfully removed analysis with ID: ${id}`);
    }
    async structureTextWithOpenAI(text, documentType) {
        if (!this.openai) {
            this.logger.error('OpenAI client is not initialized. Cannot structure text.');
            throw new common_1.InternalServerErrorException('OpenAI client is not initialized.');
        }
        if (!text || text.trim().length === 0) {
            this.logger.warn('No text provided to structureTextWithOpenAI.');
            return null;
        }
        const prompt = documentType === 'indicators' ? prompts_1.PROMPT_INDICATORS : prompts_1.PROMPT_DESCRIPTIVE;
        const modelToUse = "gpt-4o";
        this.logger.log(`Sending text (length: ${text.length}) to OpenAI model ${modelToUse} with documentType '${documentType}'.`);
        try {
            const response = await this.openai.chat.completions.create({
                model: modelToUse,
                messages: [
                    {
                        role: 'system',
                        content: 'Ти корисний асистент, що повертає ТІЛЬКИ валідний JSON.',
                    },
                    { role: 'user', content: prompt + "\n\nТекст документу:\n" + text },
                ],
                response_format: { type: 'json_object' },
            });
            const resultJsonString = response.choices[0]?.message?.content;
            if (resultJsonString) {
                this.logger.log(`Received JSON string from OpenAI (first 200 chars): ${resultJsonString.substring(0, 200)}...`);
                try {
                    const parsedJson = JSON.parse(resultJsonString);
                    this.logger.log('Successfully parsed JSON from OpenAI response.');
                    return parsedJson;
                }
                catch (parseError) {
                    this.logger.error(`Failed to parse JSON from OpenAI: ${parseError.message}. Response was: ${resultJsonString}`);
                    return { error: 'Failed to parse OpenAI JSON response', rawResponse: resultJsonString };
                }
            }
            else {
                this.logger.warn('OpenAI response did not contain content.');
                return null;
            }
        }
        catch (error) {
            this.logger.error(`Error calling OpenAI API: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException(`Error calling OpenAI API: ${error.message}`);
        }
    }
    async extractTextFromPdf(filePath) {
        this.logger.log(`Attempting to extract text from PDF: ${filePath}`);
        try {
            const data = new Uint8Array(fs.readFileSync(filePath));
            if (typeof pdfjsLib.GlobalWorkerOptions.workerSrc === 'undefined' || pdfjsLib.GlobalWorkerOptions.workerSrc === '') {
                const pdfWorkerPath = require.resolve('pdfjs-dist/legacy/build/pdf.worker.js');
                pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerPath;
                this.logger.log('Set pdf.js workerSrc to: ' + pdfWorkerPath);
            }
            const pdfDoc = await pdfjsLib.getDocument({ data }).promise;
            let fullText = '';
            for (let i = 1; i <= pdfDoc.numPages; i++) {
                const page = await pdfDoc.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                    .filter(item => typeof item.str === 'string')
                    .map(item => item.str)
                    .join(' ');
                fullText += pageText + '\n';
            }
            this.logger.log(`Successfully extracted text from PDF: ${filePath}. Length: ${fullText.length}`);
            return fullText.trim();
        }
        catch (error) {
            this.logger.error(`Failed to extract text from PDF ${filePath}: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException(`Failed to process PDF file: ${error.message}`);
        }
    }
    async extractTextFromImage(filePath) {
        this.logger.log(`Attempting to extract text from image: ${filePath}`);
        let worker;
        try {
            worker = await (0, tesseract_js_1.createWorker)(['ukr', 'eng']);
            this.logger.debug(`[Tesseract.js] Worker created for image: ${filePath}`);
            const { data: { text } } = await worker.recognize(filePath);
            this.logger.log(`Successfully extracted text from image: ${filePath}. Text length: ${text.length}`);
            if (text.length < 200) {
                this.logger.debug(`[Tesseract.js] Extracted text: ${text}`);
            }
            else {
                this.logger.debug(`[Tesseract.js] Extracted text (first 200 chars): ${text.substring(0, 200)}...`);
            }
            return text.trim();
        }
        catch (error) {
            this.logger.error(`Failed to extract text from image ${filePath}: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException(`Failed to process image file with Tesseract.js: ${error.message}`);
        }
        finally {
            if (worker) {
                await worker.terminate();
                this.logger.log(`Tesseract worker terminated for image: ${filePath}`);
            }
        }
    }
    async findAllUniqueIndicatorNamesByUser(userId) {
        this.logger.log(`Finding all unique indicator names for user ID: ${userId}`);
        const results = await this.indicatorRepository.createQueryBuilder("indicator")
            .select("DISTINCT indicator.name", "name")
            .innerJoin("indicator.analysis", "analysis")
            .where("analysis.userId = :userId", { userId })
            .orderBy("indicator.name", "ASC")
            .getRawMany();
        return results.map(result => result.name);
    }
    async findIndicatorHistoryByUser(userId, indicatorName) {
        this.logger.log(`Finding history for indicator "${indicatorName}" for user ID: ${userId}`);
        const indicators = await this.indicatorRepository.createQueryBuilder("indicator")
            .innerJoin("indicator.analysis", "analysis")
            .where("analysis.userId = :userId", { userId })
            .andWhere("indicator.name = :indicatorName", { indicatorName })
            .select([
            "analysis.analysisDate",
            "analysis.uploadTimestamp",
            "indicator.value",
            "indicator.units",
            "indicator.referenceRange",
            "indicator.analysisId"
        ])
            .orderBy("analysis.analysisDate", "DESC", "NULLS LAST")
            .addOrderBy("analysis.uploadTimestamp", "DESC")
            .getMany();
        return indicators.map(ind => ({
            analysisDate: ind.analysis?.analysisDate || null,
            uploadTimestamp: ind.analysis.uploadTimestamp,
            value: ind.value,
            units: ind.units,
            referenceRange: ind.referenceRange,
            analysisId: ind.analysisId,
        }));
    }
    async createBloodPressureReading(userId, dto) {
        this.logger.log(`Creating blood pressure reading for user ID: ${userId}`);
        const newReading = this.bloodPressureRepository.create({
            ...dto,
            userId,
        });
        try {
            return await this.bloodPressureRepository.save(newReading);
        }
        catch (error) {
            this.logger.error(`Failed to save blood pressure reading for user ${userId}`, error.stack);
            throw new common_1.InternalServerErrorException('Failed to save blood pressure reading.');
        }
    }
    async getBloodPressureReadingsForUser(userId) {
        this.logger.log(`Fetching blood pressure readings for user ID: ${userId}`);
        try {
            return await this.bloodPressureRepository.find({
                where: { userId },
                order: { timestamp: 'DESC' },
            });
        }
        catch (error) {
            this.logger.error(`Failed to fetch blood pressure readings for user ${userId}`, error.stack);
            throw new common_1.InternalServerErrorException('Failed to fetch blood pressure readings.');
        }
    }
    async getDashboardSummary(userId) {
        this.logger.log(`Fetching dashboard summary for user ID: ${userId}`);
        const lastBloodPressure = await this.bloodPressureRepository.findOne({
            where: { userId },
            order: { timestamp: 'DESC' },
        });
        this.logger.debug(`Last blood pressure for user ${userId}: ${JSON.stringify(lastBloodPressure)}`);
        const recentAnalysesRaw = await this.analysisRepository.find({
            where: { userId },
            order: { uploadTimestamp: 'DESC' },
            take: 3,
            relations: [],
        });
        const recentAnalyses = recentAnalysesRaw.map(analysis => ({
            id: analysis.id,
            documentType: analysis.documentType || analysis.originalName,
            analysisDate: analysis.analysisDate,
            uploadTimestamp: analysis.uploadTimestamp,
            originalName: analysis.originalName,
        }));
        this.logger.debug(`Recent analyses for user ${userId}: ${JSON.stringify(recentAnalyses)}`);
        const keyIndicatorNames = ['Холестерин загальний', 'Глюкоза'];
        const keyIndicators = [];
        for (const indicatorName of keyIndicatorNames) {
            const latestIndicator = await this.indicatorRepository
                .createQueryBuilder('indicator')
                .innerJoin('indicator.analysis', 'analysis')
                .where('analysis.userId = :userId', { userId })
                .andWhere('indicator.name = :indicatorName', { indicatorName })
                .orderBy('analysis.uploadTimestamp', 'DESC')
                .select([
                'indicator.name',
                'indicator.value',
                'indicator.units',
                'indicator.referenceRange',
                'analysis.analysisDate',
                'analysis.id',
            ])
                .limit(1)
                .getRawOne();
            if (latestIndicator) {
                keyIndicators.push({
                    name: latestIndicator.indicator_name,
                    value: latestIndicator.indicator_value,
                    units: latestIndicator.indicator_units,
                    referenceRange: latestIndicator.indicator_referenceRange,
                    analysisDate: latestIndicator.analysis_analysisDate,
                    analysisId: latestIndicator.analysis_id,
                });
            }
        }
        this.logger.debug(`Key indicators for user ${userId}: ${JSON.stringify(keyIndicators)}`);
        return {
            lastBloodPressure,
            recentAnalyses,
            keyIndicators,
        };
    }
};
exports.AnalysesService = AnalysesService;
exports.AnalysesService = AnalysesService = AnalysesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(models_1.Analysis)),
    __param(1, (0, typeorm_1.InjectRepository)(models_1.Indicator)),
    __param(2, (0, typeorm_1.InjectRepository)(models_1.BloodPressureReading)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], AnalysesService);
//# sourceMappingURL=analyses.service.js.map