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
exports.Indicator = void 0;
const typeorm_1 = require("typeorm");
const analysis_entity_1 = require("./analysis.entity");
let Indicator = class Indicator {
};
exports.Indicator = Indicator;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Indicator.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Indicator.prototype, "analysisId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => analysis_entity_1.Analysis, analysis => analysis.indicators, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'analysisId' }),
    __metadata("design:type", analysis_entity_1.Analysis)
], Indicator.prototype, "analysis", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Indicator.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], Indicator.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], Indicator.prototype, "units", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], Indicator.prototype, "referenceRange", void 0);
exports.Indicator = Indicator = __decorate([
    (0, typeorm_1.Entity)('indicators')
], Indicator);
//# sourceMappingURL=indicator.entity.js.map