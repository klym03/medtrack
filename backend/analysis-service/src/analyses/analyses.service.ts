import { Injectable, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Analysis, Indicator, IndicatorReferenceRange, User, SexConstraint as UserSexConstraint, BloodPressureReading } from '@shared/models';
import { CreateAnalysisDto, UpdateAnalysisDto, CreateIndicatorDto, UpdateIndicatorDto, CreateBloodPressureDto } from '../dto';
import * as fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
import { createWorker } from 'tesseract.js';
import { OpenAI } from 'openai';
import { PROMPT_INDICATORS, PROMPT_DESCRIPTIVE } from './prompts';
import { ConfigService } from '@nestjs/config';

// ---> ДОДАНО: Інтерфейси для відповіді дашборду
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
// ---<

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

// Interface for data passed from controller to service for creating analysis from upload
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

// Helper function to extract date - can be outside the class or a static method if preferred
const extractAnalysisDateFromText = (text: string | null): string | null => {
  if (!text) return null;

  // Order matters: check for YYYY-MM-DD first, then DD.MM.YYYY to avoid ambiguity with month/day
  const patterns = [
    { regex: /\b(\d{4})[-.\/](\d{1,2})[-.\/](\d{1,2})\b/, yearIndex: 1, monthIndex: 2, dayIndex: 3 }, // YYYY-MM-DD or YYYY.MM.DD or YYYY/MM/DD
    { regex: /\b(\d{1,2})[-.\/](\d{1,2})[-.\/](\d{4})\b/, yearIndex: 3, monthIndex: 2, dayIndex: 1 }  // DD.MM.YYYY or DD-MM-YYYY or DD/MM/YYYY
  ];

  for (const pattern of patterns) {
    const match = pattern.regex.exec(text);
    if (match) {
      try {
        const year = parseInt(match[pattern.yearIndex], 10);
        const month = parseInt(match[pattern.monthIndex], 10);
        const day = parseInt(match[pattern.dayIndex], 10);

        // Basic validation for month and day
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          // Format to YYYY-MM-DD
          return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
      } catch (e) {
        // Continue to next pattern if parsing fails
      }
    }
  }
  return null;
};

@Injectable()
export class AnalysesService {
  private readonly logger = new Logger(AnalysesService.name);
  private openai: OpenAI | undefined;
  private userRepository: Repository<User>;

  constructor(
    @InjectRepository(Analysis)
    private readonly analysisRepository: Repository<Analysis>,
    @InjectRepository(Indicator)
    private readonly indicatorRepository: Repository<Indicator>,
    @InjectRepository(BloodPressureReading)
    private readonly bloodPressureRepository: Repository<BloodPressureReading>,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.error('OPENAI_API_KEY is not configured! OpenAI features will be disabled.');
    } else {
      this.openai = new OpenAI({ apiKey });
      this.logger.log('OpenAI client initialized successfully.');
    }
  }

  async createAnalysisFromUpload(data: CreateAnalysisFromUploadData): Promise<Analysis> {
    this.logger.log(`Creating analysis from upload for user ID: ${data.userId}, filename: ${data.savedFilename}, document type: ${data.documentType}`);

    let determinedAnalysisDate = data.analysisDate;
    if (!determinedAnalysisDate && data.extractedTextPreview) {
      this.logger.log(`Analysis date not provided, attempting to extract from text for file: ${data.savedFilename}`);
      determinedAnalysisDate = extractAnalysisDateFromText(data.extractedTextPreview);
      if (determinedAnalysisDate) {
        this.logger.log(`Successfully extracted analysis date: ${determinedAnalysisDate} for file: ${data.savedFilename}`);
      } else {
        this.logger.log(`Could not extract analysis date from text for file: ${data.savedFilename}`);
      }
    }

    const newAnalysisEntity = this.analysisRepository.create({
      userId: data.userId,
      filename: data.savedFilename, // This is the unique name on the server
      originalName: data.originalName,
      mimeType: data.mimeType,
      size: data.size,
      uploadTimestamp: new Date(),
      documentType: data.documentType,
      rawResultText: data.extractedTextPreview,
      structuredReportData: data.documentType !== 'indicators' ? data.structuredData : null, // Store full JSON for descriptive, null for indicators initially
      analysisDate: determinedAnalysisDate, // Use determined date
      // Indicators will be linked after the main analysis entity is saved
    });

    let savedAnalysis = await this.analysisRepository.save(newAnalysisEntity);
    this.logger.log(`Saved base analysis from upload with ID: ${savedAnalysis.id}. Document type: ${data.documentType}`);

    if (data.documentType === 'indicators' && data.structuredData && Array.isArray(data.structuredData.показники)) {
      this.logger.log(`Processing ${data.structuredData.показники.length} indicators for analysis ID: ${savedAnalysis.id}`);
      const indicatorsToCreateDto: CreateIndicatorDto[] = data.structuredData.показники.map(ind => ({
        name: ind.назва,
        value: String(ind.значення), // Ensure value is string
        units: ind.одиниці,
        referenceRange: ind.референс,
        // analysisId will be set by TypeORM or manually if needed, but repository.create usually handles it with relations
      }));

      if (indicatorsToCreateDto.length > 0) {
        const createdIndicators: Indicator[] = [];
        for (const indicatorDto of indicatorsToCreateDto) {
          const newIndicatorEntity = this.indicatorRepository.create({
            ...indicatorDto,
            analysis: savedAnalysis, // Link to the saved analysis
            analysisId: savedAnalysis.id // Explicitly set analysisId
          });
          const savedIndicator = await this.indicatorRepository.save(newIndicatorEntity);
          createdIndicators.push(savedIndicator);
        }
        this.logger.log(`Saved ${createdIndicators.length} indicators for analysis ID: ${savedAnalysis.id}.`);

        // Reload the analysis to include the newly created indicators
        const reloadedAnalysisWithIndicators = await this.analysisRepository.findOne({
          where: { id: savedAnalysis.id },
          relations: ['indicators', 'user'], // Ensure 'user' relation is also loaded if needed elsewhere
        });

        if (!reloadedAnalysisWithIndicators) {
          this.logger.error(`Failed to reload analysis ID ${savedAnalysis.id} after saving indicators.`);
          throw new InternalServerErrorException('Failed to reload analysis after saving indicators');
        }
        this.logger.log(`Successfully reloaded analysis ID ${savedAnalysis.id} with ${reloadedAnalysisWithIndicators.indicators?.length || 0} indicators.`);
        return reloadedAnalysisWithIndicators; // Return the reloaded entity
      }
    } else if (data.documentType === 'indicators') {
        this.logger.log(`Document type is 'indicators' but no valid 'показники' array found in structuredData for analysis ID: ${savedAnalysis.id}. Proceeding without creating indicators.`);
    }


    // If not 'indicators' or no indicators to create, reload to ensure consistent return object with relations
    const reloadedAnalysis = await this.analysisRepository.findOne({
        where: { id: savedAnalysis.id },
        relations: ['indicators', 'user'], 
    });
    if (!reloadedAnalysis) {
        this.logger.error(`Failed to reload analysis ID ${savedAnalysis.id} (non-indicator path or empty indicators).`);
        throw new InternalServerErrorException('Failed to reload analysis');
    }
    return reloadedAnalysis;
  }

  async create(createAnalysisDto: CreateAnalysisDto, userId: string): Promise<Analysis> {
    this.logger.log(`Attempting to create analysis for user ID: ${userId} using generic create`);
    const { indicators, ...analysisData } = createAnalysisDto;

    const newAnalysisEntity = this.analysisRepository.create({
      ...analysisData, // Expects CreateAnalysisDto to have all necessary fields for Analysis
      userId: userId,
      // structuredReportData should be part of analysisData if provided in CreateAnalysisDto
    });

    let savedAnalysis = await this.analysisRepository.save(newAnalysisEntity);
    this.logger.log(`Saved base analysis with ID: ${savedAnalysis.id}`);

    if (indicators && indicators.length > 0) {
      await Promise.all(
        indicators.map(async (indicatorDto: CreateIndicatorDto) => {
          const newIndicatorEntity = this.indicatorRepository.create({
            ...indicatorDto,
            analysisId: savedAnalysis.id,
          });
          return this.indicatorRepository.save(newIndicatorEntity);
        }),
      );
      this.logger.log(`Saved ${indicators.length} indicators for analysis ID: ${savedAnalysis.id}`);
      const reloadedAnalysis = await this.analysisRepository.findOne({
        where: { id: savedAnalysis.id },
        relations: ['indicators', 'user'],
      });
      if (!reloadedAnalysis) { 
        this.logger.error(`Failed to reload analysis ID ${savedAnalysis.id} after saving indicators in generic create.`);
        throw new InternalServerErrorException('Failed to reload analysis after saving indicators in generic create');
      }
      savedAnalysis = reloadedAnalysis;
    } else { // If there are no indicators, we still need to load the user relation if it was not loaded.
      const reloadedAnalysis = await this.analysisRepository.findOne({
        where: { id: savedAnalysis.id },
        relations: ['indicators', 'user'], // Ensure relations are loaded
      });
      if (!reloadedAnalysis) {
        this.logger.error(`Failed to reload analysis ID ${savedAnalysis.id} in generic create (no indicators).`);
        throw new InternalServerErrorException('Failed to reload analysis in generic create (no indicators).');
      }
      savedAnalysis = reloadedAnalysis;
    }
    return savedAnalysis;
  }

  async findAllByUser(userId: string): Promise<Analysis[]> {
    this.logger.log(`Finding all analyses for user ID: ${userId}`);
    return this.analysisRepository.find({
      where: { userId },
      relations: ['indicators', 'user'], // Added user to relation for completeness
    });
  }

  async findOne(id: string, userId: string): Promise<Analysis> {
    this.logger.log(`Finding analysis with ID: ${id} for user ID: ${userId}`);
    const analysis = await this.analysisRepository.findOne({
      where: { id, userId },
      relations: ['indicators', 'user'],
    });
    if (!analysis) {
      this.logger.warn(`Analysis with ID "${id}" not found for user ID "${userId}".`);
      throw new NotFoundException(`Analysis with ID "${id}" not found for this user.`);
    }
    return analysis;
  }

  async update(id: string, updateAnalysisDto: UpdateAnalysisDto, userId: string): Promise<Analysis> {
    this.logger.log(`Attempting to update analysis ID: ${id} for user ID: ${userId}`);
    // Ensure analysis exists and belongs to the user
    const existingAnalysis = await this.analysisRepository.findOne({
      where: { id, userId },
      relations: ['indicators'] // Load existing indicators for comparison
    });

    if (!existingAnalysis) {
      this.logger.warn(`Update failed: Analysis with ID "${id}" not found for user ID "${userId}".`);
      throw new NotFoundException(`Analysis with ID "${id}" not found for this user.`);
    }

    const { indicators: indicatorDtos, ...analysisDataToUpdate } = updateAnalysisDto;

    // Update base analysis properties
    // TypeORM's update doesn't run subscribers or cascades, so merge and save is often better for complex updates.
    // However, for simple field updates, `update` is fine if we handle relations manually.
    await this.analysisRepository.update(existingAnalysis.id, analysisDataToUpdate);
    this.logger.log(`Updated base analysis properties for ID: ${existingAnalysis.id}`);

    // Handle indicators update (create, update, delete)
    if (indicatorDtos) {
      this.logger.log(`Processing ${indicatorDtos.length} indicators for update on analysis ID: ${id}`);
      const currentIndicators = existingAnalysis.indicators || [];
      const processedIndicatorIds = new Set<string>();

      for (const indicatorDto of indicatorDtos) {
        if (indicatorDto.id) { // Existing indicator: update it
          const indicatorToUpdate = currentIndicators.find(ind => ind.id === indicatorDto.id);
          if (indicatorToUpdate) {
            await this.indicatorRepository.update(indicatorDto.id, 
              {
                name: indicatorDto.name, 
                value: indicatorDto.value, 
                units: indicatorDto.units, 
                referenceRange: indicatorDto.referenceRange
              });
            processedIndicatorIds.add(indicatorDto.id);
            this.logger.log(`Updated indicator ID: ${indicatorDto.id}`);
          } else {
            this.logger.warn(`Indicator with ID ${indicatorDto.id} from DTO not found in existing analysis ${id}, skipping update.`);
          }
        } else { // New indicator: create it
          const newIndicatorEntity = this.indicatorRepository.create({
            ...indicatorDto,
            analysisId: existingAnalysis.id,
          });
          const savedNewIndicator = await this.indicatorRepository.save(newIndicatorEntity);
          processedIndicatorIds.add(savedNewIndicator.id);
          this.logger.log(`Created new indicator with ID: ${savedNewIndicator.id} for analysis ${id}`);
        }
      }

      // Delete indicators that were present in existingAnalysis.indicators but not in processedIndicatorIds
      const indicatorsToDelete = currentIndicators.filter(ind => ind.id && !processedIndicatorIds.has(ind.id));
      if (indicatorsToDelete.length > 0) {
        await this.indicatorRepository.remove(indicatorsToDelete);
        this.logger.log(`Removed ${indicatorsToDelete.length} indicators not present in update DTO for analysis ${id}.`);
      }
    }

    // Reload the analysis to get the final state with all changes
    const reloadedAnalysis = await this.analysisRepository.findOne({
        where: { id: existingAnalysis.id, userId }, // ensure userId for security
        relations: ['indicators', 'user'],
    });

    if (!reloadedAnalysis) {
        this.logger.error(`Analysis with ID "${id}" could not be reloaded after update.`);
        throw new NotFoundException(`Analysis with ID "${id}" could not be reloaded after update.`);
    }
    this.logger.log(`Finished updating analysis ID: ${id}.`);
    return reloadedAnalysis;
  }

  async remove(id: string, userId: string): Promise<void> {
    this.logger.log(`Attempting to remove analysis ID: ${id} for user ID: ${userId}`);
    // findOne will throw NotFoundException if not found or not owned by user
    const analysisToRemove = await this.findOne(id, userId);
    await this.analysisRepository.remove(analysisToRemove); // remove() handles cascades based on entity definition
    this.logger.log(`Successfully removed analysis with ID: ${id}`);
  }

  async structureTextWithOpenAI(
    text: string,
    documentType: 'indicators' | 'descriptive',
  ): Promise<any | null> {
    if (!this.openai) {
      this.logger.error('OpenAI client is not initialized. Cannot structure text.');
      throw new InternalServerErrorException('OpenAI client is not initialized.');
    }
    if (!text || text.trim().length === 0) {
      this.logger.warn('No text provided to structureTextWithOpenAI.');
      return null;
    }

    const prompt = documentType === 'indicators' ? PROMPT_INDICATORS : PROMPT_DESCRIPTIVE;
    const modelToUse = "gpt-4o"; // Or your preferred model

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
        } catch (parseError) {
          this.logger.error(`Failed to parse JSON from OpenAI: ${(parseError as Error).message}. Response was: ${resultJsonString}`);
          // Return an error object or throw, depending on desired error handling
          return { error: 'Failed to parse OpenAI JSON response', rawResponse: resultJsonString };
        }
      } else {
        this.logger.warn('OpenAI response did not contain content.');
        return null;
      }
    } catch (error) {
      this.logger.error(`Error calling OpenAI API: ${(error as Error).message}`, (error as Error).stack);
      throw new InternalServerErrorException(`Error calling OpenAI API: ${(error as Error).message}`);
    }
  }

  async extractTextFromPdf(filePath: string): Promise<string> {
    this.logger.log(`Attempting to extract text from PDF: ${filePath}`);
    try {
      const data = new Uint8Array(fs.readFileSync(filePath));
      // Ensure workerSrc is correctly set up for pdfjs-dist
      // For NestJS, this might need to be served statically or configured in a specific way
      if (typeof (pdfjsLib as any).GlobalWorkerOptions.workerSrc === 'undefined' || (pdfjsLib as any).GlobalWorkerOptions.workerSrc === '') {
         // Fallback or environment-specific path. This is a common issue.
         // For simplicity in this example, assuming it's available globally or via CDN.
         // In a real app, you might need to copy pdf.worker.js to your assets or use a dynamic import.
         const pdfWorkerPath = require.resolve('pdfjs-dist/legacy/build/pdf.worker.js');
         (pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfWorkerPath;
         this.logger.log('Set pdf.js workerSrc to: ' + pdfWorkerPath);
      }

      const pdfDoc = await pdfjsLib.getDocument({ data }).promise;
      let fullText = '';

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .filter(item => typeof (item as any).str === 'string') // Ensure item.str is a string
          .map(item => (item as any).str)
          .join(' ');
        fullText += pageText + '\n';
      }
      this.logger.log(`Successfully extracted text from PDF: ${filePath}. Length: ${fullText.length}`);
      return fullText.trim();
    } catch (error) {
      this.logger.error(`Failed to extract text from PDF ${filePath}: ${(error as Error).message}`, (error as Error).stack);
      throw new InternalServerErrorException(`Failed to process PDF file: ${(error as Error).message}`);
    }
  }

  async extractTextFromImage(filePath: string): Promise<string> {
    this.logger.log(`Attempting to extract text from image: ${filePath}`);
    let worker; // Define worker here to ensure it's in scope for finally block
    try {
      worker = await createWorker(['ukr', 'eng']);
      this.logger.debug(`[Tesseract.js] Worker created for image: ${filePath}`);
      const { data: { text } } = await worker.recognize(filePath);
      this.logger.log(`Successfully extracted text from image: ${filePath}. Text length: ${text.length}`);
      if (text.length < 200) {
        this.logger.debug(`[Tesseract.js] Extracted text: ${text}`);
      } else {
        this.logger.debug(`[Tesseract.js] Extracted text (first 200 chars): ${text.substring(0,200)}...`);
      }
      return text.trim();
    } catch (error) {
      this.logger.error(`Failed to extract text from image ${filePath}: ${(error as Error).message}`, (error as Error).stack);
      throw new InternalServerErrorException(`Failed to process image file with Tesseract.js: ${(error as Error).message}`);
    } finally {
      if (worker) {
        await worker.terminate();
        this.logger.log(`Tesseract worker terminated for image: ${filePath}`);
      }
    }
  }

  async findAllUniqueIndicatorNamesByUser(userId: string): Promise<string[]> {
    this.logger.log(`Finding all unique indicator names for user ID: ${userId}`);
    const results = await this.indicatorRepository.createQueryBuilder("indicator")
      .select("DISTINCT indicator.name", "name")
      .innerJoin("indicator.analysis", "analysis")
      .where("analysis.userId = :userId", { userId })
      .orderBy("indicator.name", "ASC")
      .getRawMany();

    return results.map(result => result.name);
  }

  async findIndicatorHistoryByUser(userId: string, indicatorName: string): Promise<IndicatorHistoryItem[]> {
    this.logger.log(`Finding history for indicator "${indicatorName}" for user ID: ${userId}`);
    
    const indicators = await this.indicatorRepository.createQueryBuilder("indicator")
      .innerJoin("indicator.analysis", "analysis") // Ensure the alias 'analysis' is used for the join
      .where("analysis.userId = :userId", { userId })
      .andWhere("indicator.name = :indicatorName", { indicatorName })
      .select([
        "analysis.analysisDate",      // Date of the analysis itself
        "analysis.uploadTimestamp",   // When the file was uploaded
        "indicator.value",
        "indicator.units",
        "indicator.referenceRange",
        "indicator.analysisId"        // ID of the analysis this indicator belongs to
      ])
      .orderBy("analysis.analysisDate", "DESC", "NULLS LAST") // Prioritize actual analysis date
      .addOrderBy("analysis.uploadTimestamp", "DESC") // Then by upload time
      .getMany();

    // The result of getMany when using select is a partial entity.
    // We need to map it to our IndicatorHistoryItem interface.
    return indicators.map(ind => ({
        analysisDate: ind.analysis?.analysisDate || null,
      uploadTimestamp: ind.analysis.uploadTimestamp,
        value: ind.value,
        units: ind.units,
      referenceRange: ind.referenceRange,
      analysisId: ind.analysisId,
    }));
  }

  async createBloodPressureReading(userId: string, dto: CreateBloodPressureDto): Promise<BloodPressureReading> {
    this.logger.log(`Creating blood pressure reading for user ID: ${userId}`);
    const newReading = this.bloodPressureRepository.create({
      ...dto,
      userId,
      // `timestamp` буде встановлено автоматично через @CreateDateColumn,
      // якщо не надано в DTO, або використає значення з DTO.
    });
    try {
      return await this.bloodPressureRepository.save(newReading);
    } catch (error) {
      this.logger.error(`Failed to save blood pressure reading for user ${userId}`, error.stack);
      throw new InternalServerErrorException('Failed to save blood pressure reading.');
    }
  }

  async getBloodPressureReadingsForUser(userId: string): Promise<BloodPressureReading[]> {
    this.logger.log(`Fetching blood pressure readings for user ID: ${userId}`);
    try {
      return await this.bloodPressureRepository.find({
        where: { userId },
        order: { timestamp: 'DESC' }, // Найновіші спочатку
      });
    } catch (error) {
      this.logger.error(`Failed to fetch blood pressure readings for user ${userId}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch blood pressure readings.');
    }
  }

  async getDashboardSummary(userId: string): Promise<DashboardSummaryResponse> {
    this.logger.log(`Fetching dashboard summary for user ID: ${userId}`);

    // 1. Останній запис тиску
    const lastBloodPressure = await this.bloodPressureRepository.findOne({
      where: { userId },
      order: { timestamp: 'DESC' },
    });
    this.logger.debug(`Last blood pressure for user ${userId}: ${JSON.stringify(lastBloodPressure)}`);

    // 2. Останні аналізи (наприклад, 3)
    const recentAnalysesRaw = await this.analysisRepository.find({
      where: { userId },
      order: { uploadTimestamp: 'DESC' }, // Можна сортувати за analysisDate, якщо воно завжди є
      take: 3,
      relations: [], // Не завантажуємо показники тут, щоб не перевантажувати
    });
    
    const recentAnalyses: RecentAnalysisItem[] = recentAnalysesRaw.map(analysis => ({
      id: analysis.id,
      documentType: analysis.documentType || analysis.originalName, // Використовуємо documentType або originalName
      analysisDate: analysis.analysisDate,
      uploadTimestamp: analysis.uploadTimestamp,
      originalName: analysis.originalName,
    }));
    this.logger.debug(`Recent analyses for user ${userId}: ${JSON.stringify(recentAnalyses)}`);

    // 3. Ключові показники
    const keyIndicatorNames = ['Холестерин загальний', 'Глюкоза']; // Можна винести в конфігурацію
    const keyIndicators: KeyIndicatorItem[] = [];

    for (const indicatorName of keyIndicatorNames) {
      const latestIndicator = await this.indicatorRepository
        .createQueryBuilder('indicator')
        .innerJoin('indicator.analysis', 'analysis')
        .where('analysis.userId = :userId', { userId })
        .andWhere('indicator.name = :indicatorName', { indicatorName })
        // Пріоритет сортування: спочатку за датою аналізу (якщо є), потім за датою завантаження
        // Важливо, щоб nulls last для analysisDate, якщо ми хочемо останні актуальні дані
        // Але оскільки ми шукаємо ОСТАННІЙ, то DESC для дат.
        // Якщо analysisDate може бути null, то таке сортування може бути не зовсім точним без додаткової обробки null.
        // Для простоти, поки що сортуємо за датою завантаження аналізу.
        // Краще було б сортувати за analysis.analysisDate DESC NULLS LAST, потім analysis.uploadTimestamp DESC
        // Але TypeORM може мати нюанси з NULLS LAST/FIRST залежно від БД.
        // Альтернатива: отримувати всі, сортувати в коді. Або забезпечити, щоб analysisDate завжди було.
        .orderBy('analysis.uploadTimestamp', 'DESC') 
        // Якщо є analysisDate, можна зробити так, але треба обробити null:
        // .addOrderBy('CASE WHEN analysis.analysisDate IS NULL THEN 1 ELSE 0 END', 'ASC') // Nulls last hack
        // .addOrderBy('analysis.analysisDate', 'DESC')
        .select([
          'indicator.name',
          'indicator.value',
          'indicator.units',
          'indicator.referenceRange',
          'analysis.analysisDate',
          'analysis.id',
        ])
        .limit(1)
        .getRawOne(); // getRawOne, щоб отримати дані як об'єкт

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
} 