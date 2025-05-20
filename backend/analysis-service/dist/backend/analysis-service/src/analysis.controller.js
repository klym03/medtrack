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
exports.AnalysisController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const analysis_service_1 = require("./analysis.service");
const dto_1 = require("./dto");
const passport_1 = require("@nestjs/passport");
let AnalysisController = class AnalysisController {
    constructor(analysisService) {
        this.analysisService = analysisService;
    }
    async createAnalysis(createAnalysisDto, req) {
        const userId = req.user.id;
        return this.analysisService.createAnalysis(createAnalysisDto, userId);
    }
    async findAllUserAnalyses(req) {
        const userId = req.user.id;
        return this.analysisService.findAllByUserId(userId);
    }
    async findOneUserAnalysis(id, req) {
        const userId = req.user.id;
        const analysis = await this.analysisService.findOneById(id, userId);
        if (!analysis) {
            throw new common_1.NotFoundException(`Analysis with ID "${id}" not found or not accessible by this user.`);
        }
        return analysis;
    }
    async updateCurrentUserAnalysis(id, req, updateAnalysisDto) {
        const userId = req.user.id;
        const updatedAnalysis = await this.analysisService.updateAnalysis(id, userId, updateAnalysisDto);
        if (!updatedAnalysis) {
            throw new common_1.NotFoundException(`Analysis with ID "${id}" not found or not accessible by this user.`);
        }
        return updatedAnalysis;
    }
    async deleteCurrentUserAnalysis(id, req) {
        const userId = req.user.id;
        const result = await this.analysisService.deleteAnalysis(id, userId);
        if (!result.deleted) {
            throw new common_1.NotFoundException(`Analysis with ID "${id}" not found or not accessible by this user.`);
        }
    }
    async createAnalysisFromOcr(file, body, req) {
        if (!file) {
            throw new common_1.BadRequestException('File is required for OCR upload.');
        }
        if (!body.documentType) {
            throw new common_1.BadRequestException('documentType is required in the request body for OCR upload.');
        }
        const userId = req.user.id;
        let ocrResult;
        try {
            ocrResult = await this.analysisService.performOcr(file.buffer, file.mimetype, body.documentType, file.originalname);
        }
        catch (ocrError) {
            console.error(`Error in controller calling performOcr: ${ocrError.message}`, ocrError.stack);
            throw new common_1.InternalServerErrorException('OCR processing failed.', ocrError.message);
        }
        const { text: recognizedText, parsedIndicators, descriptiveData } = ocrResult;
        const finalIndicators = (body.indicators && body.indicators.length > 0)
            ? body.indicators
            : parsedIndicators;
        const createAnalysisDto = {
            filename: file.originalname,
            documentType: body.documentType,
            analysisDate: body.analysisDate,
            rawResultText: recognizedText,
            indicators: finalIndicators || [],
            structuredReportData: descriptiveData,
        };
        return this.analysisService.createAnalysis(createAnalysisDto, userId);
    }
};
exports.AnalysisController = AnalysisController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateAnalysisDto, Object]),
    __metadata("design:returntype", Promise)
], AnalysisController.prototype, "createAnalysis", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalysisController.prototype, "findAllUserAnalyses", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AnalysisController.prototype, "findOneUserAnalysis", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, skipMissingProperties: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, dto_1.UpdateAnalysisDto]),
    __metadata("design:returntype", Promise)
], AnalysisController.prototype, "updateCurrentUserAnalysis", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AnalysisController.prototype, "deleteCurrentUserAnalysis", null);
__decorate([
    (0, common_1.Post)('ocr-upload'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        fileFilter: (req, file, callback) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|bmp|tiff|webp|pdf)$/)) {
                return callback(new common_1.BadRequestException('Only image or PDF files are allowed!'), false);
            }
            callback(null, true);
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe({ transform: true, whitelist: true, skipMissingProperties: true }))),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AnalysisController.prototype, "createAnalysisFromOcr", null);
exports.AnalysisController = AnalysisController = __decorate([
    (0, common_1.Controller)('analyses'),
    __metadata("design:paramtypes", [analysis_service_1.AnalysisService])
], AnalysisController);
//# sourceMappingURL=analysis.controller.js.map