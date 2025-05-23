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
exports.MedicationReminderController = void 0;
const common_1 = require("@nestjs/common");
const medication_reminder_service_1 = require("./medication-reminder.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("./auth/guards/jwt-auth.guard");
let MedicationReminderController = class MedicationReminderController {
    constructor(reminderService) {
        this.reminderService = reminderService;
    }
    create(req, createReminderDto) {
        return this.reminderService.create(req.user.id, createReminderDto);
    }
    findAll(req) {
        return this.reminderService.findAllForUser(req.user.id);
    }
    findOne(req, id) {
        return this.reminderService.findOneForUser(req.user.id, id);
    }
    update(req, id, updateReminderDto) {
        return this.reminderService.update(req.user.id, id, updateReminderDto);
    }
    remove(req, id) {
        return this.reminderService.remove(req.user.id, id);
    }
};
exports.MedicationReminderController = MedicationReminderController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateMedicationReminderDto]),
    __metadata("design:returntype", void 0)
], MedicationReminderController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MedicationReminderController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MedicationReminderController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.UpdateMedicationReminderDto]),
    __metadata("design:returntype", void 0)
], MedicationReminderController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MedicationReminderController.prototype, "remove", null);
exports.MedicationReminderController = MedicationReminderController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('medication-reminders'),
    __metadata("design:paramtypes", [medication_reminder_service_1.MedicationReminderService])
], MedicationReminderController);
//# sourceMappingURL=medication-reminder.controller.js.map