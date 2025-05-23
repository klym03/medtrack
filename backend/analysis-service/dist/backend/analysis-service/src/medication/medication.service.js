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
exports.MedicationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const medication_entity_1 = require("../../../../shared/models/medication.entity");
let MedicationService = class MedicationService {
    constructor(medicationRepository) {
        this.medicationRepository = medicationRepository;
    }
    async create(createMedicationDto, userFromJwt) {
        const newMedication = this.medicationRepository.create({
            ...createMedicationDto,
            user: userFromJwt,
        });
        return this.medicationRepository.save(newMedication);
    }
    async findAllByUser(userId) {
        return this.medicationRepository.find({ where: { user: { id: userId } } });
    }
    async findOneById(id, userId) {
        const medication = await this.medicationRepository.findOne({ where: { id, user: { id: userId } } });
        if (!medication) {
            throw new common_1.NotFoundException(`Medication with ID "${id}" not found for this user.`);
        }
        return medication;
    }
    async update(id, updateMedicationDto, userId) {
        const medicationToUpdate = await this.findOneById(id, userId);
        const updatedMedication = await this.medicationRepository.preload({
            id: medicationToUpdate.id,
            ...updateMedicationDto,
        });
        if (!updatedMedication) {
            throw new common_1.NotFoundException(`Medication with ID "${id}" could not be preloaded for update.`);
        }
        return this.medicationRepository.save(updatedMedication);
    }
    async remove(id, userId) {
        const medication = await this.findOneById(id, userId);
        const result = await this.medicationRepository.delete(medication.id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Medication with ID "${id}" not found or already deleted.`);
        }
    }
};
exports.MedicationService = MedicationService;
exports.MedicationService = MedicationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(medication_entity_1.Medication)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MedicationService);
//# sourceMappingURL=medication.service.js.map