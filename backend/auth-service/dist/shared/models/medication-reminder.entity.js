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
exports.MedicationReminder = exports.DayOfWeek = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const medication_entity_1 = require("./medication.entity");
var DayOfWeek;
(function (DayOfWeek) {
    DayOfWeek["SUNDAY"] = "SUNDAY";
    DayOfWeek["MONDAY"] = "MONDAY";
    DayOfWeek["TUESDAY"] = "TUESDAY";
    DayOfWeek["WEDNESDAY"] = "WEDNESDAY";
    DayOfWeek["THURSDAY"] = "THURSDAY";
    DayOfWeek["FRIDAY"] = "FRIDAY";
    DayOfWeek["SATURDAY"] = "SATURDAY";
})(DayOfWeek || (exports.DayOfWeek = DayOfWeek = {}));
let MedicationReminder = class MedicationReminder {
};
exports.MedicationReminder = MedicationReminder;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MedicationReminder.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.medicationReminders, { onDelete: 'CASCADE', nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], MedicationReminder.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => medication_entity_1.Medication, (medication) => medication.reminders, { onDelete: 'CASCADE', nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'medication_id' }),
    __metadata("design:type", medication_entity_1.Medication)
], MedicationReminder.prototype, "medication", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time', name: 'reminder_time' }),
    __metadata("design:type", String)
], MedicationReminder.prototype, "reminderTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', array: true, nullable: true, name: 'days_of_week' }),
    __metadata("design:type", Object)
], MedicationReminder.prototype, "daysOfWeek", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true, name: 'specific_date' }),
    __metadata("design:type", Object)
], MedicationReminder.prototype, "specificDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true, name: 'is_active' }),
    __metadata("design:type", Boolean)
], MedicationReminder.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], MedicationReminder.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true, name: 'last_triggered_at' }),
    __metadata("design:type", Object)
], MedicationReminder.prototype, "lastTriggeredAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' }),
    __metadata("design:type", Date)
], MedicationReminder.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', name: 'updated_at' }),
    __metadata("design:type", Date)
], MedicationReminder.prototype, "updatedAt", void 0);
exports.MedicationReminder = MedicationReminder = __decorate([
    (0, typeorm_1.Entity)('medication_reminders')
], MedicationReminder);
//# sourceMappingURL=medication-reminder.entity.js.map