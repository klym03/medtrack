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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const models_1 = require("../../../shared/models/index.js");
const tesseract_js_1 = require("tesseract.js");
const pdfjsLib = require("pdfjs-dist");
const canvas_1 = require("canvas");
const openai_1 = require("openai");
class NodeCanvasFactory {
    create(width, height) {
        const canvas = (0, canvas_1.createCanvas)(width, height);
        const context = canvas.getContext('2d');
        return {
            canvas,
            context,
        };
    }
    reset(canvasAndContext, width, height) {
        canvasAndContext.canvas.width = width;
        canvasAndContext.canvas.height = height;
    }
    destroy(canvasAndContext) {
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
const MIN_OCR_CHARS_FOR_IMAGE_TEXT_ANALYSIS = 50;
const DESCRIPTIVE_DOC_TYPES = ['ultrasound', 'mri', 'ct', 'conclusion', 'other_descriptive'];
let AnalysisService = class AnalysisService {
    constructor(analysisRepository, indicatorRepository, userRepository) {
        this.analysisRepository = analysisRepository;
        this.indicatorRepository = indicatorRepository;
        this.userRepository = userRepository;
        if (typeof process !== 'undefined' && process.versions != null && process.versions.node != null) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve('pdfjs-dist/build/pdf.worker.js');
        }
        if (!process.env.OPENAI_API_KEY) {
            console.warn('OPENAI_API_KEY не знайдено в змінних середовища. Функціонал OpenAI буде недоступний.');
        }
        this.openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    async createAnalysis(createAnalysisDto, userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        const newAnalysis = this.analysisRepository.create({
            ...createAnalysisDto,
            userId: user.id,
        });
        if (createAnalysisDto.indicators && createAnalysisDto.indicators.length > 0) {
            newAnalysis.indicators = createAnalysisDto.indicators.map(indicatorDto => this.indicatorRepository.create(indicatorDto));
        }
        try {
            const savedAnalysis = await this.analysisRepository.save(newAnalysis);
            return savedAnalysis;
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to save analysis', error.message);
        }
    }
    async findAllByUserId(userId) {
        return this.analysisRepository.find({
            where: { userId },
            relations: ['indicators'],
            order: { uploadTimestamp: 'DESC' },
        });
    }
    async findOneById(id, userId) {
        const analysis = await this.analysisRepository.findOne({
            where: { id, userId },
            relations: ['indicators'],
        });
        if (!analysis) {
            return null;
        }
        return analysis;
    }
    async updateAnalysis(id, userId, updateAnalysisDto) {
        const analysis = await this.analysisRepository.findOne({
            where: { id, userId },
            relations: ['indicators'],
        });
        if (!analysis) {
            return null;
        }
        if (updateAnalysisDto.filename !== undefined)
            analysis.filename = updateAnalysisDto.filename;
        if (updateAnalysisDto.documentType !== undefined)
            analysis.documentType = updateAnalysisDto.documentType;
        if (updateAnalysisDto.analysisDate !== undefined)
            analysis.analysisDate = updateAnalysisDto.analysisDate;
        if (updateAnalysisDto.rawResultText !== undefined)
            analysis.rawResultText = updateAnalysisDto.rawResultText;
        if (updateAnalysisDto.structuredReportData !== undefined)
            analysis.structuredReportData = updateAnalysisDto.structuredReportData;
        if (updateAnalysisDto.indicators) {
            if (analysis.indicators && analysis.indicators.length > 0) {
                await this.indicatorRepository.remove(analysis.indicators);
            }
            analysis.indicators = updateAnalysisDto.indicators.map(indicatorDto => this.indicatorRepository.create(indicatorDto));
        }
        try {
            return await this.analysisRepository.save(analysis);
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to update analysis', error.message);
        }
    }
    async deleteAnalysis(id, userId) {
        const analysis = await this.analysisRepository.findOne({ where: { id, userId } });
        if (!analysis) {
            return { deleted: false, id };
        }
        try {
            await this.analysisRepository.remove(analysis);
            return { deleted: true, id };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to delete analysis', error.message);
        }
    }
    async _recognizeTextFromImageBuffer(imageBuffer, tesseractWorker) {
        await tesseractWorker.reinitialize('ukr+eng');
        const { data: { text } } = await tesseractWorker.recognize(imageBuffer);
        return text;
    }
    async performOcr(originalFileBuffer, mimetype, documentType, originalFilename) {
        let recognizedText = '';
        const tesseractWorker = await (0, tesseract_js_1.createWorker)();
        let parsedIndicators = [];
        let descriptiveData = undefined;
        let ocrPerformedOnImage = false;
        try {
            if (mimetype.startsWith('image/')) {
                recognizedText = await this._recognizeTextFromImageBuffer(originalFileBuffer, tesseractWorker);
                ocrPerformedOnImage = true;
            }
            else if (mimetype === 'application/pdf') {
                const pdfDocument = await pdfjsLib.getDocument({ data: new Uint8Array(originalFileBuffer) }).promise;
                const numPages = pdfDocument.numPages;
                let fullTextFromPdf = '';
                for (let i = 1; i <= numPages; i++) {
                    const page = await pdfDocument.getPage(i);
                    const viewport = page.getViewport({ scale: 2.0 });
                    const canvasFactory = new NodeCanvasFactory();
                    const canvasAndContext = canvasFactory.create(viewport.width, viewport.height);
                    const renderContext = { canvasContext: canvasAndContext.context, viewport, canvasFactory };
                    await page.render(renderContext).promise;
                    const imageBufferFromPage = canvasAndContext.canvas.toBuffer('image/png');
                    canvasFactory.destroy(canvasAndContext);
                    const textFromPage = await this._recognizeTextFromImageBuffer(imageBufferFromPage, tesseractWorker);
                    fullTextFromPdf += textFromPage + '\n';
                }
                recognizedText = fullTextFromPdf.trim();
            }
            else {
                throw new common_1.BadRequestException('Unsupported file type for OCR. Only images and PDFs are allowed.');
            }
            const isDescriptiveType = DESCRIPTIVE_DOC_TYPES.includes(documentType);
            const promptToUse = isDescriptiveType ? PROMPT_DESCRIPTIVE : PROMPT_INDICATORS;
            let sendImageToOpenAI = false;
            if (ocrPerformedOnImage &&
                (!recognizedText || recognizedText.length < MIN_OCR_CHARS_FOR_IMAGE_TEXT_ANALYSIS) &&
                !isDescriptiveType) {
                console.log(`Локальний OCR для зображення ${originalFilename} дав мало тексту. Спроба відправити зображення в OpenAI.`);
                sendImageToOpenAI = true;
            }
            if ((recognizedText || sendImageToOpenAI) && this.openai && process.env.OPENAI_API_KEY) {
                console.log(`Відправка даних в OpenAI (тип: ${isDescriptiveType ? 'описовий' : 'показники'}, джерело: ${sendImageToOpenAI ? 'зображення' : 'текст'})...`);
                const messages = [
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
                }
                else {
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
                            descriptiveData = result;
                        }
                        else if (result.показники && Array.isArray(result.показники)) {
                            parsedIndicators = result.показники.map((ind) => ({
                                name: ind.назва,
                                value: ind.значення ? String(ind.значення) : null,
                                units: ind.одиниці,
                                referenceRange: ind.референс,
                            })).filter(ind => ind.name && ind.value);
                        }
                        else {
                            console.warn(`Відповідь OpenAI (${isDescriptiveType ? 'описовий' : 'показники'}) не містить очікуваних даних.`);
                        }
                    }
                    else {
                        console.warn('Отримано порожню відповідь від OpenAI.');
                    }
                }
                catch (e) {
                    console.error('Помилка під час взаємодії з OpenAI API:', e);
                    throw new common_1.InternalServerErrorException('Failed to process document with OpenAI', e.message);
                }
            }
            else if (!recognizedText && !sendImageToOpenAI) {
                console.warn('Текст не було розпізнано, зображення не надсилалося. Запит до OpenAI не виконувався.');
            }
            else if (!this.openai || !process.env.OPENAI_API_KEY) {
                console.warn('OpenAI клієнт не ініціалізовано або ключ API відсутній. Обробка через OpenAI пропущена.');
            }
            return { text: recognizedText, parsedIndicators, descriptiveData };
        }
        catch (error) {
            console.error('OCR Processing or OpenAI Error:', error);
            if (error instanceof common_1.BadRequestException || error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to perform OCR, parse, or interact with OpenAI', error.message);
        }
        finally {
            await tesseractWorker.terminate();
        }
    }
};
exports.AnalysisService = AnalysisService;
exports.AnalysisService = AnalysisService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(models_1.Analysis)),
    __param(1, (0, typeorm_1.InjectRepository)(models_1.Indicator)),
    __param(2, (0, typeorm_1.InjectRepository)(models_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AnalysisService);
//# sourceMappingURL=analysis.service.js.map