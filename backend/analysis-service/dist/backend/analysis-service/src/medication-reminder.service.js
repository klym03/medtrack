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
exports.MedicationReminderService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const medication_reminder_entity_1 = require("../../../shared/models/medication-reminder.entity");
const user_entity_1 = require("../../../shared/models/user.entity");
const medication_entity_1 = require("../../../shared/models/medication.entity");
let MedicationReminderService = class MedicationReminderService {
    constructor(reminderRepository, medicationRepository, userRepository) {
        this.reminderRepository = reminderRepository;
        this.medicationRepository = medicationRepository;
        this.userRepository = userRepository;
    }
    async create(userId, createDto) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const medication = await this.medicationRepository.findOne({
            where: { id: createDto.medicationId, user: { id: userId } },
            relations: ['user']
        });
        if (!medication) {
            throw new common_1.NotFoundException(`Medication with ID "${createDto.medicationId}" not found or does not belong to the user.`);
        }
        const newReminder = this.reminderRepository.create({
            ...createDto,
            user,
            medication,
            reminderTime: createDto.reminderTime,
            daysOfWeek: createDto.daysOfWeek,
            specificDate: createDto.specificDate ? new Date(createDto.specificDate) : null,
            isActive: createDto.isActive !== undefined ? createDto.isActive : true,
        });
        return this.reminderRepository.save(newReminder);
    }
    async findAllForUser(userId) {
        return this.reminderRepository.find({
            where: { user: { id: userId } },
            relations: ['medication'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOneForUser(userId, reminderId) {
        const reminder = await this.reminderRepository.findOne({
            where: { id: reminderId, user: { id: userId } },
            relations: ['medication', 'user'],
        });
        if (!reminder) {
            throw new common_1.NotFoundException(`Medication reminder with ID "${reminderId}" not found or does not belong to the user.`);
        }
        return reminder;
    }
    async update(userId, reminderId, updateDto) {
        const reminder = await this.findOneForUser(userId, reminderId);
        if (updateDto.medicationId && updateDto.medicationId !== reminder.medication.id) {
            const newMedication = await this.medicationRepository.findOne({
                where: { id: updateDto.medicationId, user: { id: userId } },
                relations: ['user']
            });
            if (!newMedication) {
                throw new common_1.NotFoundException(`New medication with ID "${updateDto.medicationId}" not found or does not belong to user.`);
            }
            reminder.medication = newMedication;
        }
        if (updateDto.reminderTime !== undefined) {
            reminder.reminderTime = updateDto.reminderTime;
        }
        if (updateDto.daysOfWeek !== undefined) {
            reminder.daysOfWeek = updateDto.daysOfWeek;
        }
        if (updateDto.specificDate !== undefined) {
            reminder.specificDate = updateDto.specificDate ? new Date(updateDto.specificDate) : null;
        }
        if (updateDto.isActive !== undefined) {
            reminder.isActive = updateDto.isActive;
        }
        if (updateDto.notes !== undefined) {
            reminder.notes = updateDto.notes;
        }
        return this.reminderRepository.save(reminder);
    }
    async remove(userId, reminderId) {
        const reminder = await this.findOneForUser(userId, reminderId);
        await this.reminderRepository.remove(reminder);
    }
};
exports.MedicationReminderService = MedicationReminderService;
exports.MedicationReminderService = MedicationReminderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(medication_reminder_entity_1.MedicationReminder)),
    __param(1, (0, typeorm_1.InjectRepository)(medication_entity_1.Medication)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MedicationReminderService);
//# sourceMappingURL=medication-reminder.service.js.map