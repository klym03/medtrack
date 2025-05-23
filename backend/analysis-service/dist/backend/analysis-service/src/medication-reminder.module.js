"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicationReminderModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const medication_reminder_service_1 = require("./medication-reminder.service");
const medication_reminder_controller_1 = require("./medication-reminder.controller");
const medication_reminder_entity_1 = require("../../../shared/models/medication-reminder.entity");
const user_entity_1 = require("../../../shared/models/user.entity");
const medication_entity_1 = require("../../../shared/models/medication.entity");
const auth_module_1 = require("./auth/auth.module");
let MedicationReminderModule = class MedicationReminderModule {
};
exports.MedicationReminderModule = MedicationReminderModule;
exports.MedicationReminderModule = MedicationReminderModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([medication_reminder_entity_1.MedicationReminder, user_entity_1.User, medication_entity_1.Medication]),
            auth_module_1.AuthModule,
        ],
        controllers: [medication_reminder_controller_1.MedicationReminderController],
        providers: [medication_reminder_service_1.MedicationReminderService],
    })
], MedicationReminderModule);
//# sourceMappingURL=medication-reminder.module.js.map