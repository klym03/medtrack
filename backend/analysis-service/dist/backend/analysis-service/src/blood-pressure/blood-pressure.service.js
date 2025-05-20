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
exports.BloodPressureService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const blood_pressure_reading_entity_1 = require("../../../../shared/models/blood-pressure-reading.entity");
let BloodPressureService = class BloodPressureService {
    constructor(readingRepository) {
        this.readingRepository = readingRepository;
    }
    async create(userIdFromJwt, createDto) {
        const newReading = this.readingRepository.create({
            ...createDto,
            userId: userIdFromJwt,
            timestamp: createDto.timestamp ? new Date(createDto.timestamp) : new Date(),
        });
        return this.readingRepository.save(newReading);
    }
    async findAllByUser(userId) {
        return this.readingRepository.find({
            where: { userId },
            order: { timestamp: 'DESC' },
        });
    }
    async findOne(readingId, userIdFromJwt) {
        const reading = await this.readingRepository.findOne({ where: { id: readingId } });
        if (!reading) {
            throw new common_1.NotFoundException(`Запис тиску з ID "${readingId}" не знайдено.`);
        }
        if (reading.userId !== userIdFromJwt) {
            throw new common_1.ForbiddenException('Ви не маєте доступу до цього запису.');
        }
        return reading;
    }
    async update(readingId, userIdFromJwt, updateDto) {
        const reading = await this.findOne(readingId, userIdFromJwt);
        if (updateDto.systolic !== undefined)
            reading.systolic = updateDto.systolic;
        if (updateDto.diastolic !== undefined)
            reading.diastolic = updateDto.diastolic;
        if (updateDto.timestamp !== undefined)
            reading.timestamp = new Date(updateDto.timestamp);
        return this.readingRepository.save(reading);
    }
    async remove(readingId, userIdFromJwt) {
        const reading = await this.findOne(readingId, userIdFromJwt);
        await this.readingRepository.remove(reading);
    }
};
exports.BloodPressureService = BloodPressureService;
exports.BloodPressureService = BloodPressureService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(blood_pressure_reading_entity_1.BloodPressureReading)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BloodPressureService);
//# sourceMappingURL=blood-pressure.service.js.map