import { Controller, Post, Body, UseGuards, Request, ValidationPipe, HttpCode, HttpStatus, Get, Param, NotFoundException, ParseUUIDPipe, Put, Delete, UseInterceptors, UploadedFile, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AnalysisService } from './analysis.service';
import { CreateAnalysisDto, UpdateAnalysisDto, CreateIndicatorDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { Analysis } from '@shared/models'; // Для типізації повернення
import { Express } from 'express'; // Для типу Multer.File

@Controller('analyses') // Префікс маршруту для всіх методів контролера
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post()
  @UseGuards(AuthGuard('jwt')) // Захищаємо ендпоінт
  @HttpCode(HttpStatus.CREATED)
  async createAnalysis(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) createAnalysisDto: CreateAnalysisDto,
    @Request() req, // Отримуємо доступ до об'єкта запиту, щоб взяти req.user
  ): Promise<Analysis> {
    const userId = req.user.id; // req.user додається JwtStrategy
    return this.analysisService.createAnalysis(createAnalysisDto, userId);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAllUserAnalyses(@Request() req): Promise<Analysis[]> {
    const userId = req.user.id;
    return this.analysisService.findAllByUserId(userId);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOneUserAnalysis(
    @Param('id', new ParseUUIDPipe()) id: string, // Валідація, що id є UUID
    @Request() req
  ): Promise<Analysis> {
    const userId = req.user.id;
    const analysis = await this.analysisService.findOneById(id, userId);
    if (!analysis) {
      throw new NotFoundException(`Analysis with ID "${id}" not found or not accessible by this user.`);
    }
    return analysis;
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async updateCurrentUserAnalysis(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, skipMissingProperties: true })) updateAnalysisDto: UpdateAnalysisDto
  ): Promise<Analysis> {
    const userId = req.user.id;
    const updatedAnalysis = await this.analysisService.updateAnalysis(id, userId, updateAnalysisDto);
    if (!updatedAnalysis) {
      throw new NotFoundException(`Analysis with ID "${id}" not found or not accessible by this user.`);
    }
    return updatedAnalysis;
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT) // Стандартний код для успішного DELETE без тіла відповіді
  async deleteCurrentUserAnalysis(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req
  ): Promise<void> { // Повертає void, оскільки відповідь 204 No Content
    const userId = req.user.id;
    const result = await this.analysisService.deleteAnalysis(id, userId);
    if (!result.deleted) {
      throw new NotFoundException(`Analysis with ID "${id}" not found or not accessible by this user.`);
    }
    // Немає потреби повертати тіло для 204
  }

  @Post('ocr-upload')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: (req, file, callback) => {
      // Дозволяємо зображення АБО PDF
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|bmp|tiff|webp|pdf)$/)) {
        return callback(new BadRequestException('Only image or PDF files are allowed!'), false);
      }
      callback(null, true);
    },
  }))
  async createAnalysisFromOcr(
    @UploadedFile() file: Express.Multer.File,
    @Body(new ValidationPipe({ transform: true, whitelist: true, skipMissingProperties: true })) body: Partial<CreateAnalysisDto>, 
    @Request() req,
  ): Promise<Analysis> {
    if (!file) {
      throw new BadRequestException('File is required for OCR upload.');
    }
    if (!body.documentType) {
        throw new BadRequestException('documentType is required in the request body for OCR upload.');
    }

    const userId = req.user.id;
    // Типізуємо результат з OcrResult з сервісу
    let ocrResult: { text: string; parsedIndicators: CreateIndicatorDto[]; descriptiveData?: Record<string, any> }; 
    try {
      // Передаємо file.buffer, file.mimetype, body.documentType та file.originalname до сервісу
      ocrResult = await this.analysisService.performOcr(
        file.buffer, 
        file.mimetype, 
        body.documentType, // documentType тепер обов'язковий
        file.originalname
      );
    } catch (ocrError) {
      console.error(`Error in controller calling performOcr: ${ocrError.message}`, ocrError.stack);
      throw new InternalServerErrorException('OCR processing failed.', ocrError.message);
    }

    const { text: recognizedText, parsedIndicators, descriptiveData } = ocrResult;

    // Визначаємо, які індикатори використовувати:
    // - Якщо користувач передав індикатори в тілі запиту, використовуємо їх.
    // - Інакше, використовуємо індикатори, розпізнані з тексту.
    // - Якщо немає ані тих, ані інших, indicators буде порожнім масивом.
    const finalIndicators = (body.indicators && body.indicators.length > 0) 
                            ? body.indicators 
                            : parsedIndicators;

    const createAnalysisDto: CreateAnalysisDto = {
      filename: file.originalname,
      documentType: body.documentType, // Використовуємо переданий documentType
      analysisDate: body.analysisDate, 
      rawResultText: recognizedText,
      indicators: finalIndicators || [], 
      structuredReportData: descriptiveData, // Додаємо descriptiveData
    };

    return this.analysisService.createAnalysis(createAnalysisDto, userId);
  }

  // Тут будуть інші ендпоінти (GET, PUT, DELETE)
}
