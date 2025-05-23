import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseUUIDPipe, UseInterceptors, UploadedFile, InternalServerErrorException, Logger, Query, HttpCode, HttpStatus, ValidationPipe } from '@nestjs/common';
import { AnalysesService } from './analyses.service';
import { CreateAnalysisDto } from '../dto/create-analysis.dto';
import { UpdateAnalysisDto } from '../dto/update-analysis.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { CreateBloodPressureDto } from '../dto';
import { BloodPressureReading } from '@shared/models';
import { DashboardSummaryResponse } from './analyses.service';

// Переконуємось, що папка для завантажень існує
// Використовуємо process.cwd() для отримання кореневої директорії проекту analysis-service
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads'); 
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  console.log(`Uploads directory created: ${UPLOADS_DIR}`); // Додамо лог для перевірки
} else {
  console.log(`Uploads directory already exists: ${UPLOADS_DIR}`); // Додамо лог для перевірки
}

@Controller('analyses')
export class AnalysesController {
  private readonly logger = new Logger(AnalysesController.name);
  constructor(private readonly analysesService: AnalysesService) {}

  @Get('ping') 
  pingAnalyses() {
    this.logger.log('Ping endpoint in AnalysesController was hit!');
    return { message: 'pong from analyses controller' };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createAnalysisDto: CreateAnalysisDto, @Req() req) {
    return this.analysesService.create(createAnalysisDto, req.user.id);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File, 
    @Req() req, 
    @Body() body: { documentType?: 'indicators' | 'descriptive' }
  ) {
    this.logger.log(`File upload attempt for user ID: ${req.user.id}, original filename: ${file.originalname}`);
    if (!file) {
      this.logger.warn('No file uploaded.');
      throw new InternalServerErrorException('No file uploaded.');
    }

    const documentTypeFromRequest = body.documentType || null; // Ensure it's null if not provided
    this.logger.log(`Received documentType: ${documentTypeFromRequest}`);

    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFilename);
    let extractedText: string | null = null;
    let structuredDataFromAI: any | null = null;

    try {
      await fs.promises.writeFile(filePath, file.buffer);
      this.logger.log(`File saved successfully: ${filePath}`);

      if (file.mimetype === 'application/pdf') {
        this.logger.log(`Attempting to extract text from PDF: ${filePath}`);
        extractedText = await this.analysesService.extractTextFromPdf(filePath);
      } else if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
        this.logger.log(`Attempting to extract text from image: ${filePath}`);
        extractedText = await this.analysesService.extractTextFromImage(filePath);
      } else {
        this.logger.log(`File type ${file.mimetype} is not PDF or a supported image, skipping text extraction.`);
      }

      if (extractedText) {
         this.logger.log(`Extracted text (first 200 chars): ${extractedText.substring(0, 200)}...`);
         if (documentTypeFromRequest) {
            this.logger.log(`Attempting to structure extracted text using OpenAI, documentType: ${documentTypeFromRequest}`);
            structuredDataFromAI = await this.analysesService.structureTextWithOpenAI(extractedText, documentTypeFromRequest);
            if (structuredDataFromAI && !structuredDataFromAI.error) {
              this.logger.log('Successfully structured text with OpenAI.');
            } else if (structuredDataFromAI && structuredDataFromAI.error) {
              this.logger.warn(`Failed to structure text with OpenAI. Error: ${structuredDataFromAI.error}`);
            } else {
              this.logger.warn('Structuring text with OpenAI returned no data and no specific error.');
            }
        } else {
            this.logger.warn('Extracted text is available, but documentType was not provided. Skipping OpenAI structuring.');
        }
      }
      
      // Call service to create analysis entity with all gathered data
      const analysisCreationData = {
        userId: req.user.id,
        originalName: file.originalname,
        savedFilename: uniqueFilename,
        mimeType: file.mimetype,
        size: file.size,
        documentType: documentTypeFromRequest,
        extractedTextPreview: extractedText, // Pass full extracted text
        structuredData: structuredDataFromAI, // Pass data from AI (could be null or have error)
        // analysisDate could be added if extracted or provided
      };

      this.logger.log(`Calling analysesService.createAnalysisFromUpload with data for file: ${uniqueFilename}`);
      const createdAnalysis = await this.analysesService.createAnalysisFromUpload(analysisCreationData);
      this.logger.log(`Successfully created analysis with ID: ${createdAnalysis.id} from uploaded file.`);

      // The response can be the createdAnalysis object itself, or a custom message
      return createdAnalysis; // This will include the ID, indicators, etc.

    } catch (error) {
      this.logger.error(`Failed to process file ${uniqueFilename}: ${error.message}`, error.stack);
      if (fs.existsSync(filePath)) {
        try {
          await fs.promises.unlink(filePath);
          this.logger.log(`Cleaned up partially saved file: ${filePath}`);
        } catch (cleanupError) {
          this.logger.error(`Failed to cleanup partially saved file ${filePath}: ${cleanupError.message}`, cleanupError.stack);
        }
      }
      // Check if the error is an instance of HttpException to preserve its status code
      if (error instanceof InternalServerErrorException || error.status) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to process uploaded file: ${error.message}`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req) {
    return this.analysesService.findAllByUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.analysesService.findOne(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAnalysisDto: UpdateAnalysisDto,
    @Req() req,
  ) {
    return this.analysesService.update(id, updateAnalysisDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.analysesService.remove(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/indicator-names')
  async findAllUniqueIndicatorNames(@Req() req) {
    this.logger.log(`Request to get all unique indicator names for user ID: ${req.user.id}`);
    return this.analysesService.findAllUniqueIndicatorNamesByUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/indicator-history')
  async findIndicatorHistory(
    @Req() req,
    @Query('name') indicatorName: string,
  ) {
    if (!indicatorName) {
      throw new InternalServerErrorException('Indicator name query parameter is required.');
    }
    this.logger.log(`Request to get history for indicator "${indicatorName}" for user ID: ${req.user.id}`);
    return this.analysesService.findIndicatorHistoryByUser(req.user.id, indicatorName);
  }

  @UseGuards(JwtAuthGuard)
  @Post('blood-pressure-readings')
  @HttpCode(HttpStatus.CREATED)
  async createBloodPressureReading(
    @Req() req,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) dto: CreateBloodPressureDto,
  ): Promise<BloodPressureReading> {
    this.logger.log(`Request to create blood pressure reading for user ID: ${req.user.id}`);
    return this.analysesService.createBloodPressureReading(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('blood-pressure-readings')
  async getBloodPressureReadings(@Req() req): Promise<BloodPressureReading[]> {
    this.logger.log(`Request to get blood pressure readings for user ID: ${req.user.id}`);
    return this.analysesService.getBloodPressureReadingsForUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/dashboard-summary')
  async getDashboardSummary(@Req() req): Promise<DashboardSummaryResponse> {
    this.logger.log(`Request to get dashboard summary for user ID: ${req.user.id}`);
    return this.analysesService.getDashboardSummary(req.user.id);
  }
} 