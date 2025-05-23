import { MedicationService } from './medication.service';
import { CreateMedicationDto, UpdateMedicationDto } from '../dto';
import { Medication } from '../../../../shared/models/medication.entity';
export declare class MedicationController {
    private readonly medicationService;
    constructor(medicationService: MedicationService);
    create(createMedicationDto: CreateMedicationDto, req: any): Promise<Medication>;
    findAllByUser(req: any): Promise<Medication[]>;
    findOne(id: string, req: any): Promise<Medication>;
    update(id: string, updateMedicationDto: UpdateMedicationDto, req: any): Promise<Medication>;
    remove(id: string, req: any): Promise<void>;
}
