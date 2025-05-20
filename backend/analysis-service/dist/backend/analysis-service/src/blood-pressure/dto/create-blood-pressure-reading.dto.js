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
exports.CreateBloodPressureReadingDto = void 0;
const class_validator_1 = require("class-validator");
class CreateBloodPressureReadingDto {
}
exports.CreateBloodPressureReadingDto = CreateBloodPressureReadingDto;
__decorate([
    (0, class_validator_1.IsInt)({ message: 'Систолічний тиск повинен бути цілим числом' }),
    (0, class_validator_1.Min)(50, { message: 'Систолічний тиск не може бути менше 50' }),
    (0, class_validator_1.Max)(300, { message: 'Систолічний тиск не може бути більше 300' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Систолічний тиск є обов\'язковим' }),
    __metadata("design:type", Number)
], CreateBloodPressureReadingDto.prototype, "systolic", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'Діастолічний тиск повинен бути цілим числом' }),
    (0, class_validator_1.Min)(30, { message: 'Діастолічний тиск не може бути менше 30' }),
    (0, class_validator_1.Max)(200, { message: 'Діастолічний тиск не може бути більше 200' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Діастолічний тиск є обов\'язковим' }),
    __metadata("design:type", Number)
], CreateBloodPressureReadingDto.prototype, "diastolic", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Час вимірювання повинен бути у форматі ISO8601' }),
    __metadata("design:type", Date)
], CreateBloodPressureReadingDto.prototype, "timestamp", void 0);
//# sourceMappingURL=create-blood-pressure-reading.dto.js.map