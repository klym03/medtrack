import { Repository } from 'typeorm';
import { Medication } from '../../../../shared/models/medication.entity';
import { User } from '../../../../shared/models/user.entity';
import { CreateMedicationDto, UpdateMedicationDto } from '../dto';
export declare class MedicationService {
    private readonly medicationRepository;
    constructor(medicationRepository: Repository<Medication>);
    create(createMedicationDto: CreateMedicationDto, userFromJwt: User): Promise<Medication>;
    findAllByUser(userId: string): Promise<Medication[]>;
    findOneById(id: string, userId: string): Promise<Medication>;
    update(id: string, updateMedicationDto: UpdateMedicationDto, userId: string): Promise<Medication>;
    remove(id: string, userId: string): Promise<void>;
}
