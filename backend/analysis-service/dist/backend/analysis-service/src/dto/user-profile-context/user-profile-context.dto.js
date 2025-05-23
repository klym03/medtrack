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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfileContextResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class LastBpDto {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], LastBpDto.prototype, "systolic", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], LastBpDto.prototype, "diastolic", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], LastBpDto.prototype, "timestamp", void 0);
class AnalysisSummaryItemDto {
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], AnalysisSummaryItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], AnalysisSummaryItemDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], AnalysisSummaryItemDto.prototype, "analysis_date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], AnalysisSummaryItemDto.prototype, "uploaded", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], AnalysisSummaryItemDto.prototype, "filename", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], AnalysisSummaryItemDto.prototype, "raw_result_text", void 0);
class UserProfileContextResponseDto {
}
exports.UserProfileContextResponseDto = UserProfileContextResponseDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UserProfileContextResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UserProfileContextResponseDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], UserProfileContextResponseDto.prototype, "age", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UserProfileContextResponseDto.prototype, "sex", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], UserProfileContextResponseDto.prototype, "height_cm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], UserProfileContextResponseDto.prototype, "weight_kg", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], UserProfileContextResponseDto.prototype, "bmi", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UserProfileContextResponseDto.prototype, "is_smoker", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], UserProfileContextResponseDto.prototype, "usual_systolic", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], UserProfileContextResponseDto.prototype, "usual_diastolic", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: () => LastBpDto }),
    __metadata("design:type", LastBpDto)
], UserProfileContextResponseDto.prototype, "last_bp", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UserProfileContextResponseDto.prototype, "indicators_summary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UserProfileContextResponseDto.prototype, "chronic_conditions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UserProfileContextResponseDto.prototype, "current_medications", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UserProfileContextResponseDto.prototype, "all_indicators_summary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: () => [AnalysisSummaryItemDto] }),
    __metadata("design:type", Array)
], UserProfileContextResponseDto.prototype, "all_analyses", void 0);
//# sourceMappingURL=user-profile-context.dto.js.map