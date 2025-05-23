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
var AnalysesController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysesController = void 0;
const common_1 = require("@nestjs/common");
const analyses_service_1 = require("./analyses.service");
const create_analysis_dto_1 = require("../dto/create-analysis.dto");
const update_analysis_dto_1 = require("../dto/update-analysis.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const platform_express_1 = require("@nestjs/platform-express");
const fs = require("fs");
const path = require("path");
const uuid_1 = require("uuid");
const dto_1 = require("../dto");
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    console.log(`Uploads directory created: ${UPLOADS_DIR}`);
}
else {
    console.log(`Uploads directory already exists: ${UPLOADS_DIR}`);
}
let AnalysesController = AnalysesController_1 = class AnalysesController {
    constructor(analysesService) {
        this.analysesService = analysesService;
        this.logger = new common_1.Logger(AnalysesController_1.name);
    }
    pingAnalyses() {
        this.logger.log('Ping endpoint in AnalysesController was hit!');
        return { message: 'pong from analyses controller' };
    }
    create(createAnalysisDto, req) {
        return this.analysesService.create(createAnalysisDto, req.user.id);
    }
    async uploadFile(file, req, body) {
        this.logger.log(`File upload attempt for user ID: ${req.user.id}, original filename: ${file.originalname}`);
        if (!file) {
            this.logger.warn('No file uploaded.');
            throw new common_1.InternalServerErrorException('No file uploaded.');
        }
        const documentTypeFromRequest = body.documentType || null;
        this.logger.log(`Received documentType: ${documentTypeFromRequest}`);
        const fileExtension = path.extname(file.originalname);
        const uniqueFilename = `${(0, uuid_1.v4)()}${fileExtension}`;
        const filePath = path.join(UPLOADS_DIR, uniqueFilename);
        let extractedText = null;
        let structuredDataFromAI = null;
        try {
            await fs.promises.writeFile(filePath, file.buffer);
            this.logger.log(`File saved successfully: ${filePath}`);
            if (file.mimetype === 'application/pdf') {
                this.logger.log(`Attempting to extract text from PDF: ${filePath}`);
                extractedText = await this.analysesService.extractTextFromPdf(filePath);
            }
            else if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
                this.logger.log(`Attempting to extract text from image: ${filePath}`);
                extractedText = await this.analysesService.extractTextFromImage(filePath);
            }
            else {
                this.logger.log(`File type ${file.mimetype} is not PDF or a supported image, skipping text extraction.`);
            }
            if (extractedText) {
                this.logger.log(`Extracted text (first 200 chars): ${extractedText.substring(0, 200)}...`);
                if (documentTypeFromRequest) {
                    this.logger.log(`Attempting to structure extracted text using OpenAI, documentType: ${documentTypeFromRequest}`);
                    structuredDataFromAI = await this.analysesService.structureTextWithOpenAI(extractedText, documentTypeFromRequest);
                    if (structuredDataFromAI && !structuredDataFromAI.error) {
                        this.logger.log('Successfully structured text with OpenAI.');
                    }
                    else if (structuredDataFromAI && structuredDataFromAI.error) {
                        this.logger.warn(`Failed to structure text with OpenAI. Error: ${structuredDataFromAI.error}`);
                    }
                    else {
                        this.logger.warn('Structuring text with OpenAI returned no data and no specific error.');
                    }
                }
                else {
                    this.logger.warn('Extracted text is available, but documentType was not provided. Skipping OpenAI structuring.');
                }
            }
            const analysisCreationData = {
                userId: req.user.id,
                originalName: file.originalname,
                savedFilename: uniqueFilename,
                mimeType: file.mimetype,
                size: file.size,
                documentType: documentTypeFromRequest,
                extractedTextPreview: extractedText,
                structuredData: structuredDataFromAI,
            };
            this.logger.log(`Calling analysesService.createAnalysisFromUpload with data for file: ${uniqueFilename}`);
            const createdAnalysis = await this.analysesService.createAnalysisFromUpload(analysisCreationData);
            this.logger.log(`Successfully created analysis with ID: ${createdAnalysis.id} from uploaded file.`);
            return createdAnalysis;
        }
        catch (error) {
            this.logger.error(`Failed to process file ${uniqueFilename}: ${error.message}`, error.stack);
            if (fs.existsSync(filePath)) {
                try {
                    await fs.promises.unlink(filePath);
                    this.logger.log(`Cleaned up partially saved file: ${filePath}`);
                }
                catch (cleanupError) {
                    this.logger.error(`Failed to cleanup partially saved file ${filePath}: ${cleanupError.message}`, cleanupError.stack);
                }
            }
            if (error instanceof common_1.InternalServerErrorException || error.status) {
                throw error;
            }
            throw new common_1.InternalServerErrorException(`Failed to process uploaded file: ${error.message}`);
        }
    }
    findAll(req) {
        return this.analysesService.findAllByUser(req.user.id);
    }
    findOne(id, req) {
        return this.analysesService.findOne(id, req.user.id);
    }
    update(id, updateAnalysisDto, req) {
        return this.analysesService.update(id, updateAnalysisDto, req.user.id);
    }
    remove(id, req) {
        return this.analysesService.remove(id, req.user.id);
    }
    async findAllUniqueIndicatorNames(req) {
        this.logger.log(`Request to get all unique indicator names for user ID: ${req.user.id}`);
        return this.analysesService.findAllUniqueIndicatorNamesByUser(req.user.id);
    }
    async findIndicatorHistory(req, indicatorName) {
        if (!indicatorName) {
            throw new common_1.InternalServerErrorException('Indicator name query parameter is required.');
        }
        this.logger.log(`Request to get history for indicator "${indicatorName}" for user ID: ${req.user.id}`);
        return this.analysesService.findIndicatorHistoryByUser(req.user.id, indicatorName);
    }
    async createBloodPressureReading(req, dto) {
        this.logger.log(`Request to create blood pressure reading for user ID: ${req.user.id}`);
        return this.analysesService.createBloodPressureReading(req.user.id, dto);
    }
    async getBloodPressureReadings(req) {
        this.logger.log(`Request to get blood pressure readings for user ID: ${req.user.id}`);
        return this.analysesService.getBloodPressureReadingsForUser(req.user.id);
    }
    async getDashboardSummary(req) {
        this.logger.log(`Request to get dashboard summary for user ID: ${req.user.id}`);
        return this.analysesService.getDashboardSummary(req.user.id);
    }
};
exports.AnalysesController = AnalysesController;
__decorate([
    (0, common_1.Get)('ping'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnalysesController.prototype, "pingAnalyses", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_analysis_dto_1.CreateAnalysisDto, Object]),
    __metadata("design:returntype", void 0)
], AnalysesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AnalysesController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AnalysesController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AnalysesController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_analysis_dto_1.UpdateAnalysisDto, Object]),
    __metadata("design:returntype", void 0)
], AnalysesController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AnalysesController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('user/indicator-names'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalysesController.prototype, "findAllUniqueIndicatorNames", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('user/indicator-history'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AnalysesController.prototype, "findIndicatorHistory", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('blood-pressure-readings'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateBloodPressureDto]),
    __metadata("design:returntype", Promise)
], AnalysesController.prototype, "createBloodPressureReading", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('blood-pressure-readings'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalysesController.prototype, "getBloodPressureReadings", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('user/dashboard-summary'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalysesController.prototype, "getDashboardSummary", null);
exports.AnalysesController = AnalysesController = AnalysesController_1 = __decorate([
    (0, common_1.Controller)('analyses'),
    __metadata("design:paramtypes", [analyses_service_1.AnalysesService])
], AnalysesController);
//# sourceMappingURL=analyses.controller.js.map