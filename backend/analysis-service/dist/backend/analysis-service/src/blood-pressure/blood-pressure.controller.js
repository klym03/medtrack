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
exports.BloodPressureController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../../shared/jwt-auth.guard");
const blood_pressure_service_1 = require("./blood-pressure.service");
const dto_1 = require("./dto");
let BloodPressureController = class BloodPressureController {
    constructor(bpService) {
        this.bpService = bpService;
    }
    async create(req, createDto) {
        const userId = req.user.userId;
        return this.bpService.create(userId, createDto);
    }
    async findAllMyReadings(req) {
        const userId = req.user.userId;
        return this.bpService.findAllByUser(userId);
    }
    async findOne(readingId, req) {
        const userId = req.user.userId;
        return this.bpService.findOne(readingId, userId);
    }
    async update(readingId, req, updateDto) {
        const userId = req.user.userId;
        return this.bpService.update(readingId, userId, updateDto);
    }
    async remove(readingId, req) {
        const userId = req.user.userId;
        return this.bpService.remove(readingId, userId);
    }
};
exports.BloodPressureController = BloodPressureController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateBloodPressureReadingDto]),
    __metadata("design:returntype", Promise)
], BloodPressureController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BloodPressureController.prototype, "findAllMyReadings", null);
__decorate([
    (0, common_1.Get)(':readingId'),
    __param(0, (0, common_1.Param)('readingId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BloodPressureController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':readingId'),
    __param(0, (0, common_1.Param)('readingId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, dto_1.UpdateBloodPressureReadingDto]),
    __metadata("design:returntype", Promise)
], BloodPressureController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':readingId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('readingId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BloodPressureController.prototype, "remove", null);
exports.BloodPressureController = BloodPressureController = __decorate([
    (0, common_1.Controller)('blood-pressure'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [blood_pressure_service_1.BloodPressureService])
], BloodPressureController);
//# sourceMappingURL=blood-pressure.controller.js.map