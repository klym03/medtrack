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
exports.IndicatorReferenceRange = exports.SexConstraint = void 0;
const typeorm_1 = require("typeorm");
var SexConstraint;
(function (SexConstraint) {
    SexConstraint["ANY"] = "any";
    SexConstraint["MALE"] = "male";
    SexConstraint["FEMALE"] = "female";
})(SexConstraint || (exports.SexConstraint = SexConstraint = {}));
let IndicatorReferenceRange = class IndicatorReferenceRange {
};
exports.IndicatorReferenceRange = IndicatorReferenceRange;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], IndicatorReferenceRange.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, comment: 'Standardized name of the indicator' }),
    __metadata("design:type", String)
], IndicatorReferenceRange.prototype, "indicatorName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, comment: 'Units of measurement' }),
    __metadata("design:type", String)
], IndicatorReferenceRange.prototype, "units", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SexConstraint,
        default: SexConstraint.ANY,
        comment: 'Sex specificity of the range: any, male, female'
    }),
    __metadata("design:type", String)
], IndicatorReferenceRange.prototype, "sexConstraint", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true, comment: 'Minimum age in years for this range (inclusive, null if no lower age limit)' }),
    __metadata("design:type", Object)
], IndicatorReferenceRange.prototype, "ageMinYears", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true, comment: 'Maximum age in years for this range (inclusive, null if no upper age limit)' }),
    __metadata("design:type", Object)
], IndicatorReferenceRange.prototype, "ageMaxYears", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true, comment: 'Lower bound of the normal range' }),
    __metadata("design:type", Object)
], IndicatorReferenceRange.prototype, "normalLow", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true, comment: 'Upper bound of the normal range' }),
    __metadata("design:type", Object)
], IndicatorReferenceRange.prototype, "normalHigh", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, comment: 'Optional textual representation of the range, e.g., \'< 5.0\' or \' > 100\'. Use normalLow/High for numeric comparisons.' }),
    __metadata("design:type", Object)
], IndicatorReferenceRange.prototype, "textualRange", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, comment: 'Source or citation for this reference range' }),
    __metadata("design:type", Object)
], IndicatorReferenceRange.prototype, "source", void 0);
exports.IndicatorReferenceRange = IndicatorReferenceRange = __decorate([
    (0, typeorm_1.Entity)('indicator_reference_ranges'),
    (0, typeorm_1.Index)('IDX_indicator_range_specificity', ['indicatorName', 'units', 'sexConstraint', 'ageMinYears', 'ageMaxYears'], { unique: true })
], IndicatorReferenceRange);
//# sourceMappingURL=indicator-reference-range.entity.js.map