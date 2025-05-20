import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Analysis, Indicator, User } from '@shared/models';
import { CreateAnalysisDto, UpdateAnalysisDto, CreateIndicatorDto } from './dto';
import { createWorker, Worker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { createCanvas } from 'canvas';
import OpenAI from 'openai';
import * as base64 from 'base-64'; // Для кодування зображення, якщо потрібно

// Налаштування для pdfjs-dist в Node.js
class NodeCanvasFactory {
  create(width: number, height: number) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');
    return {
      canvas,
      context,
    };
  }

  reset(canvasAndContext: any, width: number, height: number) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }

  destroy(canvasAndContext: any) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
}

const PROMPT_INDICATORS = `
Уважно проаналізуй наданий медичний документ (текст). Знайди ВСІ показники аналізів.
Поверни відповідь ТІЛЬКИ у вигляді валідного JSON об\\'єкта наступної структури:
{
  "показники": [
    {"назва": "Повна Назва Показника (ПЕРЕКЛАДЕНА НА УКРАЇНСЬКУ)", "значення": "Вилучене Значення (тільки число або текст)", "одиниці": "Одиниці Виміру (якщо є, інакше null)", "референс": "Референсний Діапазон (якщо є, інакше null)"}
  ]
}
Дуже важливо: поле "назва" повинно містити назву показника, ТОЧНО перекладену на УКРАЇНСЬКУ мову. Не використовуй мову оригіналу.
У полі 'референс' вказуй ТІЛЬКИ числові значення, діапазони (напр., '0.5-1.5') або умови (напр., '< 100', '> 50'). НЕ ДОДАВАЙ слова типу 'Норма', 'Рекомендовано' тощо.
НЕ ДОДАВАЙ жодних інших полів, ключів, пояснень, коментарів, \`\`\`json маркерів. ТІЛЬКИ цей JSON.
Якщо показники не знайдено, поверни: {"показники": []}.
`;

const PROMPT_DESCRIPTIVE = `
Проаналізуй наданий медичний документ (текст або зображення). Витягни ключову інформацію.
Поверни відповідь ТІЛЬКИ у вигляді валідного JSON об\\'єкта наступної структури:
{
  "тип_документу": "Тип документа (напр., МРТ головного мозку, УЗД черевної порожнини)",
  "дата_дослідження": "Дата проведення дослідження (РРРР-ММ-ДД, якщо знайдено, інакше null)",
  "опис": "Основний текст опису дослідження.",
  "висновок": "Текст заключення або висновку лікаря (якщо є).",
  "рекомендації": "Рекомендації (якщо є)."
}
НЕ ДОДАВАЙ жодних інших полів, пояснень або \`\`\`json маркерів.
`;

interface OcrResult {
  text: string;
  parsedIndicators: CreateIndicatorDto[];
  descriptiveData?: Record<string, any>; // Для результатів з PROMPT_DESCRIPTIVE
}

const MIN_OCR_CHARS_FOR_IMAGE_TEXT_ANALYSIS = 50; // Поріг для тексту з зображення
const DESCRIPTIVE_DOC_TYPES = ['ultrasound', 'mri', 'ct', 'conclusion', 'other_descriptive']; // Додайте ваші типи сюди

@Injectable()
export class AnalysisService {
  private openai: OpenAI;

  constructor(
    @InjectRepository(Analysis)
    private readonly analysisRepository: Repository<Analysis>,
    @InjectRepository(Indicator)
    private readonly indicatorRepository: Repository<Indicator>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    // Налаштування workerSrc для pdfjs-dist v2.x
    if (typeof process !== 'undefined' && process.versions != null && process.versions.node != null) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve('pdfjs-dist/build/pdf.worker.js');
    }
    // Ініціалізація OpenAI клієнта
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY не знайдено в змінних середовища. Функціонал OpenAI буде недоступний.');
    }
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async createAnalysis(createAnalysisDto: CreateAnalysisDto, userId: string): Promise<Analysis> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const newAnalysis = this.analysisRepository.create({
      ...createAnalysisDto,
      userId: user.id,
    });

    if (createAnalysisDto.indicators && createAnalysisDto.indicators.length > 0) {
      newAnalysis.indicators = createAnalysisDto.indicators.map(indicatorDto =>
        this.indicatorRepository.create(indicatorDto)
      );
    }

    try {
      const savedAnalysis = await this.analysisRepository.save(newAnalysis);
      return savedAnalysis;
    } catch (error) {
      throw new InternalServerErrorException('Failed to save analysis', error.message);
    }
  }

  async findAllByUserId(userId: string): Promise<Analysis[]> {
    return this.analysisRepository.find({
      where: { userId },
      relations: ['indicators'],
      order: { uploadTimestamp: 'DESC' },
    });
  }

  async findOneById(id: string, userId: string): Promise<Analysis | null> {
    const analysis = await this.analysisRepository.findOne({
      where: { id, userId },
      relations: ['indicators'],
    });
    if (!analysis) {
      return null;
    }
    return analysis;
  }

  async updateAnalysis(id: string, userId: string, updateAnalysisDto: UpdateAnalysisDto): Promise<Analysis | null> {
    const analysis = await this.analysisRepository.findOne({
      where: { id, userId },
      relations: ['indicators'],
    });

    if (!analysis) {
      return null;
    }

    if (updateAnalysisDto.filename !== undefined) analysis.filename = updateAnalysisDto.filename;
    if (updateAnalysisDto.documentType !== undefined) analysis.documentType = updateAnalysisDto.documentType;
    if (updateAnalysisDto.analysisDate !== undefined) analysis.analysisDate = updateAnalysisDto.analysisDate;
    if (updateAnalysisDto.rawResultText !== undefined) analysis.rawResultText = updateAnalysisDto.rawResultText;
    if (updateAnalysisDto.structuredReportData !== undefined) analysis.structuredReportData = updateAnalysisDto.structuredReportData;

    if (updateAnalysisDto.indicators) {
      if (analysis.indicators && analysis.indicators.length > 0) {
        await this.indicatorRepository.remove(analysis.indicators);
      }
      analysis.indicators = updateAnalysisDto.indicators.map(indicatorDto =>
        this.indicatorRepository.create(indicatorDto),
      );
    }

    try {
      return await this.analysisRepository.save(analysis);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update analysis', error.message);
    }
  }

  async deleteAnalysis(id: string, userId: string): Promise<{ deleted: boolean; id: string }> {
    const analysis = await this.analysisRepository.findOne({ where: { id, userId } });

    if (!analysis) {
      return { deleted: false, id };
    }
    try {
      await this.analysisRepository.remove(analysis);
      return { deleted: true, id };
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete analysis', error.message);
    }
  }

  private async _recognizeTextFromImageBuffer(imageBuffer: Buffer, tesseractWorker: Worker): Promise<string> {
    await tesseractWorker.reinitialize('ukr+eng');
    const { data: { text } } = await tesseractWorker.recognize(imageBuffer);
    return text;
  }

  async performOcr(
    originalFileBuffer: Buffer, 
    mimetype: string, 
    documentType: string, 
    originalFilename: string
  ): Promise<OcrResult> {
    let recognizedText = '';
    const tesseractWorker = await createWorker();
    let parsedIndicators: CreateIndicatorDto[] = [];
    let descriptiveData: Record<string, any> | undefined = undefined;
    let ocrPerformedOnImage = false;

    try {
      if (mimetype.startsWith('image/')) {
        recognizedText = await this._recognizeTextFromImageBuffer(originalFileBuffer, tesseractWorker);
        ocrPerformedOnImage = true;
      } else if (mimetype === 'application/pdf') {
        const pdfDocument = await pdfjsLib.getDocument({ data: new Uint8Array(originalFileBuffer) }).promise;
        const numPages = pdfDocument.numPages;
        let fullTextFromPdf = '';
        for (let i = 1; i <= numPages; i++) {
          const page = await pdfDocument.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 });
          const canvasFactory = new NodeCanvasFactory();
          const canvasAndContext = canvasFactory.create(viewport.width, viewport.height);
          const renderContext = { canvasContext: canvasAndContext.context as any, viewport, canvasFactory };
          await page.render(renderContext).promise;
          const imageBufferFromPage = canvasAndContext.canvas.toBuffer('image/png');
          canvasFactory.destroy(canvasAndContext);
          const textFromPage = await this._recognizeTextFromImageBuffer(imageBufferFromPage, tesseractWorker);
          fullTextFromPdf += textFromPage + '\n';
        }
        recognizedText = fullTextFromPdf.trim();
      } else {
        throw new BadRequestException('Unsupported file type for OCR. Only images and PDFs are allowed.');
      }

      const isDescriptiveType = DESCRIPTIVE_DOC_TYPES.includes(documentType);
      const promptToUse = isDescriptiveType ? PROMPT_DESCRIPTIVE : PROMPT_INDICATORS;
      let sendImageToOpenAI = false;

      // Логіка для вирішення, чи відправляти зображення до OpenAI
      if (ocrPerformedOnImage && 
          (!recognizedText || recognizedText.length < MIN_OCR_CHARS_FOR_IMAGE_TEXT_ANALYSIS) &&
          !isDescriptiveType // Для описових типів, якщо є хоч якийсь текст, краще його, а не зображення
         ) {
        console.log(`Локальний OCR для зображення ${originalFilename} дав мало тексту. Спроба відправити зображення в OpenAI.`);
        sendImageToOpenAI = true;
      }

      if ((recognizedText || sendImageToOpenAI) && this.openai && process.env.OPENAI_API_KEY) {
        console.log(`Відправка даних в OpenAI (тип: ${isDescriptiveType ? 'описовий' : 'показники'}, джерело: ${sendImageToOpenAI ? 'зображення' : 'текст'})...`);
        
        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
          { role: 'system', content: 'Ти корисний асистент, який повертає JSON.' },
        ];

        if (sendImageToOpenAI) {
          const base64Image = originalFileBuffer.toString('base64');
          messages.push({
            role: 'user',
            content: [
              { type: 'text', text: promptToUse },
              {
                type: 'image_url',
                image_url: { url: `data:${mimetype};base64,${base64Image}`, detail: 'auto' },
              },
            ],
          });
        } else {
          messages.push({ role: 'user', content: promptToUse + '\n\nТекст документу:\n' + recognizedText });
        }

        try {
          const completion = await this.openai.chat.completions.create({
            model: 'gpt-4o',
            messages: messages,
            response_format: { type: 'json_object' },
          });

          const resultJsonString = completion.choices[0]?.message?.content;
          if (resultJsonString) {
            console.log('Отримано відповідь від OpenAI:', resultJsonString);
            const result = JSON.parse(resultJsonString);

            if (isDescriptiveType) {
              descriptiveData = result; // Очікуємо, що весь JSON є описовими даними
            } else if (result.показники && Array.isArray(result.показники)) {
              parsedIndicators = result.показники.map((ind: any) => ({
                name: ind.назва,
                value: ind.значення ? String(ind.значення) : null,
                units: ind.одиниці,
                referenceRange: ind.референс,
              })).filter(ind => ind.name && ind.value);
            } else {
              console.warn(`Відповідь OpenAI (${isDescriptiveType ? 'описовий' : 'показники'}) не містить очікуваних даних.`);
            }
          } else {
            console.warn('Отримано порожню відповідь від OpenAI.');
          }
        } catch (e) {
          console.error('Помилка під час взаємодії з OpenAI API:', e);
          throw new InternalServerErrorException('Failed to process document with OpenAI', e.message);
        }
      } else if (!recognizedText && !sendImageToOpenAI) {
        console.warn('Текст не було розпізнано, зображення не надсилалося. Запит до OpenAI не виконувався.');
      } else if (!this.openai || !process.env.OPENAI_API_KEY) {
        console.warn('OpenAI клієнт не ініціалізовано або ключ API відсутній. Обробка через OpenAI пропущена.');
      }
      
      return { text: recognizedText, parsedIndicators, descriptiveData };

    } catch (error) {
      console.error('OCR Processing or OpenAI Error:', error);
      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to perform OCR, parse, or interact with OpenAI', error.message);
    } finally {
      await tesseractWorker.terminate();
    }
  }
}
